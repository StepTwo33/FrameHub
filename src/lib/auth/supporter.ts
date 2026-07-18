import { findUserByEmailInsensitive } from "@/lib/auth/auth";
import { isUserBanned } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export async function findVerifiedUserByDonorEmail(email: string) {
  const user = await findUserByEmailInsensitive(email);
  if (!user || isUserBanned(user) || !user.emailVerified) return null;
  return user;
}

export async function grantSupporter(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { supporterAt: new Date() },
  });
}

export async function revokeSupporter(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { supporterAt: null },
  });
}

export function isSupporter(user: { supporterAt: Date | null | undefined }): boolean {
  return user.supporterAt != null;
}
