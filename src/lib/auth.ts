import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SESSION_COOKIE = "framehub_session";
const AUTH_SECRET_RAW = process.env.AUTH_SECRET;
if (!AUTH_SECRET_RAW && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET environment variable is required in production");
}
const secret = new TextEncoder().encode(AUTH_SECRET_RAW || "dev-secret-change-me");

export interface Session {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    image: string | null;
    emailVerified: boolean;
    role: string;
  };
}

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 24;
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

function buildUsernameFallback(): string {
  return `tenno-${crypto.randomBytes(3).toString("hex")}`;
}

export function normalizeUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/[-._]{2,}/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

export function isValidUsername(input: string): boolean {
  return (
    input.length >= USERNAME_MIN_LENGTH
    && input.length <= USERNAME_MAX_LENGTH
    && USERNAME_PATTERN.test(input)
  );
}

export async function generateUniqueUsername(seed: string): Promise<string> {
  const normalized = normalizeUsername(seed);
  const base = (normalized.length >= USERNAME_MIN_LENGTH ? normalized : buildUsernameFallback())
    .slice(0, USERNAME_MAX_LENGTH);

  let candidate = base;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    const suffixText = `-${suffix}`;
    candidate = `${base.slice(0, USERNAME_MAX_LENGTH - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  return candidate;
}

// --------------- Password Hashing (PBKDF2) ---------------

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
  return crypto.timingSafeEqual(expectedKey, actualKey);
}

// --------------- Verification Codes ---------------

export function generateVerificationCode(): string {
  return crypto.randomInt(100_000, 999_999).toString();
}

export async function storeVerificationToken(email: string, code: string): Promise<void> {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  // Create new token (expires in 10 minutes)
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
}

export async function validateVerificationToken(
  email: string,
  code: string
): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: code },
  });
  if (!record) return false;
  if (record.expires < new Date()) {
    // Expired — clean up
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    });
    return false;
  }
  // Valid — delete the used token and mark email as verified
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: code } },
  });
  await prisma.user.updateMany({
    where: { email },
    data: { emailVerified: new Date() },
  });
  return true;
}

// --------------- User DB Helpers ---------------

export async function findOrCreateUser(
  email: string,
  data: { name?: string | null; image?: string | null; emailVerified?: boolean; provider?: string; providerAccountId?: string }
): Promise<Session["user"]> {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const username = await generateUniqueUsername(data.name ?? email.split("@")[0] ?? "tenno");
    user = await prisma.user.create({
      data: {
        email,
        name: data.name ?? null,
        username,
        image: data.image ?? null,
        emailVerified: data.emailVerified ? new Date() : null,
      },
    });
  }

  // If this is an OAuth login, ensure the Account link exists and merge profile
  if (data.provider && data.providerAccountId) {
    const existing = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
    });
    if (!existing) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      });
    }
    // Merge profile: fill in missing name/image from OAuth provider, verify email
    const updates: Record<string, unknown> = {};
    if (!user.name && data.name) updates.name = data.name;
    if (!user.image && data.image) updates.image = data.image;
    if (!user.emailVerified) updates.emailVerified = new Date();
    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
    }
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email!,
    image: user.image,
    emailVerified: !!(user.emailVerified || data.emailVerified),
    role: user.role,
  };
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// --------------- Session (JWT) ---------------

export async function createSession(user: Session["user"]): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

// --------------- Google OAuth ---------------

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getGoogleAuthUrl(callbackUrl: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForUser(
  code: string,
  callbackUrl: string
): Promise<{ id: string; name: string | null; email: string; image: string | null } | null> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return null;
  const tokens = await tokenRes.json();

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) return null;
  const profile = await userRes.json();

  return {
    id: profile.id,
    name: profile.name ?? null,
    email: profile.email,
    image: profile.picture ?? null,
  };
}

export { SESSION_COOKIE };
