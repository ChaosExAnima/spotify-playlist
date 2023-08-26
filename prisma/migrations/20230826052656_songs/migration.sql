-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "added_at" DATETIME NOT NULL,
    "track" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "features" TEXT NOT NULL
);
