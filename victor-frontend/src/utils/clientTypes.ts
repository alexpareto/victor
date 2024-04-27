export type Program = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  versions: ProgramVersion[];
};

export type ProgramVersion = {
  id: number;
  body: string;
  signature: string;
  description: string;
  fitness: number;
  createdAt: Date;
  updatedAt: Date;
};
