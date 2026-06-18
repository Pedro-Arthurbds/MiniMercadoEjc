/*
  Warnings:

  - The required column `publicCode` was added to the `Command` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Command" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer" TEXT NOT NULL,
    "total" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" DATETIME,
    "publicCode" TEXT NOT NULL,
    "openedByUserId" INTEGER,
    "closedByUserId" INTEGER,
    CONSTRAINT "Command_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Command_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Command" ("closed", "closedAt", "closedByUserId", "createdAt", "customer", "id", "openedByUserId", "total") SELECT "closed", "closedAt", "closedByUserId", "createdAt", "customer", "id", "openedByUserId", "total" FROM "Command";
DROP TABLE "Command";
ALTER TABLE "new_Command" RENAME TO "Command";
CREATE UNIQUE INDEX "Command_publicCode_key" ON "Command"("publicCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
