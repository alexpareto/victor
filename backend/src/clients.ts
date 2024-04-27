import { PrismaClient } from "@prisma/client";
import { OpenAI } from "openai";

export const prisma = new PrismaClient();

export const oai_client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});
