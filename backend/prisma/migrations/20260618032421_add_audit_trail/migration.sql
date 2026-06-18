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
    "openedByUserId" INTEGER,
    "closedByUserId" INTEGER,
    CONSTRAINT "Command_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Command_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Command" ("closed", "closedAt", "createdAt", "customer", "id", "total") SELECT "closed", "closedAt", "createdAt", "customer", "id", "total" FROM "Command";
DROP TABLE "Command";
ALTER TABLE "new_Command" RENAME TO "Command";
CREATE TABLE "new_CommandItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantity" INTEGER NOT NULL,
    "commandId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "addedByUserId" INTEGER,
    CONSTRAINT "CommandItem_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommandItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommandItem_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CommandItem" ("commandId", "id", "productId", "quantity") SELECT "commandId", "id", "productId", "quantity" FROM "CommandItem";
DROP TABLE "CommandItem";
ALTER TABLE "new_CommandItem" RENAME TO "CommandItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
