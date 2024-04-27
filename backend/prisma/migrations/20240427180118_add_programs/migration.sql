-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fitness" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramInvocation" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "inputArgs" JSONB NOT NULL,
    "outputArgs" JSONB NOT NULL,
    "previousInvocationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramInvocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramInvocation_programId_idx" ON "ProgramInvocation"("programId");

-- AddForeignKey
ALTER TABLE "ProgramInvocation" ADD CONSTRAINT "ProgramInvocation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInvocation" ADD CONSTRAINT "ProgramInvocation_previousInvocationId_fkey" FOREIGN KEY ("previousInvocationId") REFERENCES "ProgramInvocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
