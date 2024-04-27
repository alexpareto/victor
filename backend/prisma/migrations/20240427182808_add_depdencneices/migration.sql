-- CreateTable
CREATE TABLE "_ProgramDependency" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProgramDependency_AB_unique" ON "_ProgramDependency"("A", "B");

-- CreateIndex
CREATE INDEX "_ProgramDependency_B_index" ON "_ProgramDependency"("B");

-- AddForeignKey
ALTER TABLE "_ProgramDependency" ADD CONSTRAINT "_ProgramDependency_A_fkey" FOREIGN KEY ("A") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramDependency" ADD CONSTRAINT "_ProgramDependency_B_fkey" FOREIGN KEY ("B") REFERENCES "ProgramVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
