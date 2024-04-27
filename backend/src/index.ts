import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./clients";
import { generateFunctionBodies } from "./function_generator";

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

app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
