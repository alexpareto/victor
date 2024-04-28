import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./clients";
import { initProgram } from "./generation/program_generator";
import { showsJsonFilePath, showsTypeString } from "./datasets/tv_shows";
import { executeProgram } from "./execution/executeProgram";

dotenv.config();

const app: Express = express();
app.use(cors());
const port = process.env.PORT || 8000;
// Middleware to parse JSON bodies
app.use(express.json());

app.get("/api/test-model", async (req: Request, res: Response) => {
  const result = await prisma.testModel.findMany();
  return res.status(200).json(result);
});

app.post("/api/test-model", async (req: Request, res: Response) => {
  const { name } = req.body; // Extract name from request body
  try {
    const result = await prisma.testModel.create({ data: { name } });
    res.status(201).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: `Error creating test model: ${error.message}` });
  }
});

app.get("/api/programs/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const programWithVersionsWithDependencies =
    await prisma.program.findFirstOrThrow({
      where: { id: Number(id) },
      include: {
        versions: {
          include: {
            dependencies: {
              include: {
                versions: {
                  include: {
                    dependencies: {
                      include: {
                        versions: {
                          include: {
                            dependencies: { include: { versions: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

  res.status(201).json({ program: programWithVersionsWithDependencies });
});

app.post("/api/programs", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  console.log("got body", req.body);
  if (!prompt) {
    return res.status(400);
  }

  const [program, programGenerationPromise] = await initProgram(
    prompt,
    showsTypeString
  );
  // return the program, but await the promise so we can run things
  res.status(201).json({ program: { ...program, versions: [] } });

  // get program with versions and return it
  await programGenerationPromise;
  const programWithVersions = await prisma.program.findFirstOrThrow({
    where: { id: program.id },
    include: { versions: { include: { program: true } } },
  });
  console.log(programWithVersions);

  const results = await executeProgram(programWithVersions, showsJsonFilePath);
});

app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
