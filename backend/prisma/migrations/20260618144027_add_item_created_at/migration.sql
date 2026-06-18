-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CommandItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commandId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "addedByUserId" INTEGER,
    CONSTRAINT "CommandItem_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommandItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommandItem_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CommandItem" ("addedByUserId", "commandId", "id", "productId", "quantity") SELECT "addedByUserId", "commandId", "id", "productId", "quantity" FROM "CommandItem";
DROP TABLE "CommandItem";
ALTER TABLE "new_CommandItem" RENAME TO "CommandItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
