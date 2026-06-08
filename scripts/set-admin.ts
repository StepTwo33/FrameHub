import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { resolveSqliteDatabasePath } from "../src/lib/sqlite-path";

/** Local dev only. Requires CONFIRM_SET_ADMIN=1 — never run on production. */
if (process.env.CONFIRM_SET_ADMIN !== "1") {
    console.error(
        "Refusing to run set-admin.ts without CONFIRM_SET_ADMIN=1.\n" +
        "This script promotes every user in the database to admin.\n" +
        "Use only on a local dev database you control.",
    );
    process.exit(1);
}

const adapter = new PrismaBetterSqlite3({ url: resolveSqliteDatabasePath() });
const prisma = new PrismaClient({ adapter });

async function main() {
    // List all users
    const users = await prisma.user.findMany({
        select: { id: true, email: true, username: true, role: true },
    });
    console.log("Current users:", JSON.stringify(users, null, 2));

    if (users.length === 0) {
        console.log("No users found in DB. Sign in first, then re-run this script.");
        return;
    }

    // Set all existing users to admin (local dev bootstrap only)
    for (const user of users) {
        if (user.role !== "admin") {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: "admin" },
            });
            console.log(`Set ${user.email ?? user.username ?? user.id} -> admin`);
        } else {
            console.log(`${user.email ?? user.username ?? user.id} is already admin`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
