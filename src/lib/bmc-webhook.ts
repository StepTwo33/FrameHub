import crypto from "crypto";

export interface BmcDonationPayload {
  eventType: string;
  externalId: string;
  supporterEmail: string;
  amount: string | null;
}

function readString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
    if (typeof val === "number" && Number.isFinite(val)) return String(val);
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** Verify BMC webhook HMAC-SHA256 signature (x-signature-sha256). */
export function verifyBmcWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.trim().toLowerCase();
  if (expected.length !== received.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

/** Parse donation webhook body; returns null if not a donation event we handle. */
export function parseBmcDonationWebhook(
  rawBody: string,
  eventHeader: string | null,
): BmcDonationPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return null;
  }

  const root = asRecord(parsed);
  if (!root) return null;

  const data =
    asRecord(root.data) ??
    asRecord(root.response) ??
    asRecord(root.payload) ??
    root;

  const eventType =
    (eventHeader ?? readString(root, "type", "event", "event_type") ?? "").toLowerCase();

  if (!eventType.startsWith("donation.")) return null;

  const supporterEmail = readString(
    data,
    "supporter_email",
    "supporterEmail",
    "email",
    "payer_email",
  );
  if (!supporterEmail) return null;

  const externalId =
    readString(
      data,
      "transaction_id",
      "transactionId",
      "payment_id",
      "paymentId",
      "id",
      "support_id",
      "supportId",
    ) ?? `${eventType}:${supporterEmail}:${readString(data, "support_created_on", "created_at", "createdAt") ?? rawBody.length}`;

  const amount =
    readString(data, "total_amount", "totalAmount", "amount", "coffee_price") ??
    (() => {
      const coffees = readString(data, "number_of_coffees", "numberOfCoffees");
      return coffees ? `${coffees} coffee(s)` : null;
    })();

  return {
    eventType,
    externalId,
    supporterEmail,
    amount,
  };
}
