import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { resolveSqliteDatabasePath } from "../src/lib/sqlite-path";
import { getBootstrapAdminEmails } from "../src/lib/auth/admin";

/** Local dev only. Requires CONFIRM_SET_ADMIN=1 — never run on production. */
if (process.env.CONFIRM_SET_ADMIN !== "1") {
    console.error(
        "Refusing to run set-admin.ts without CONFIRM_SET_ADMIN=1.\n" +
        "This script promotes users listed in AUTH_ADMIN_EMAILS to admin.\n" +
        "Use only on a local dev database you control.",
    );
    process.exit(1);
}

const bootstrapEmails = getBootstrapAdminEmails();
if (bootstrapEmails.size === 0) {
    console.error(
        "Set AUTH_ADMIN_EMAILS in your environment first (comma-separated).\n" +
        "Example: AUTH_ADMIN_EMAILS=you@example.com CONFIRM_SET_ADMIN=1 npx tsx scripts/set-admin.ts",
    );
    process.exit(1);
}

const adapter = new PrismaBetterSqlite3({ url: resolveSqliteDatabasePath() });
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, username: true, role: true },
    });
    console.log("Current users:", JSON.stringify(users, null, 2));

    if (users.length === 0) {
        console.log("No users found in DB. Sign in first, then re-run this script.");
        return;
    }

    let promoted = 0;
    for (const user of users) {
        const email = user.email?.trim().toLowerCase();
        if (!email || !bootstrapEmails.has(email)) continue;
        if (user.role !== "admin") {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: "admin" },
            });
            console.log(`Set ${user.email ?? user.username ?? user.id} -> admin`);
            promoted++;
        } else {
            console.log(`${user.email ?? user.username ?? user.id} is already admin`);
        }
    }

    if (promoted === 0) {
        console.log("No matching users found for AUTH_ADMIN_EMAILS.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
