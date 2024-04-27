/*
  Warnings:

  - You are about to drop the column `body` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `fitness` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `programId` on the `ProgramInvocation` table. All the data in the column will be lost.
  - Added the required column `programVersionId` to the `ProgramInvocation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProgramInvocation" DROP CONSTRAINT "ProgramInvocation_programId_fkey";

-- DropIndex
DROP INDEX "ProgramInvocation_programId_idx";

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "body",
DROP COLUMN "description",
DROP COLUMN "fitness",
DROP COLUMN "signature";

-- AlterTable
ALTER TABLE "ProgramInvocation" DROP COLUMN "programId",
ADD COLUMN     "programVersionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProgramVersion" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fitness" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programId" INTEGER NOT NULL,

    CONSTRAINT "ProgramVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramInvocation_programVersionId_idx" ON "ProgramInvocation"("programVersionId");

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInvocation" ADD CONSTRAINT "ProgramInvocation_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
