-- CreateTable
CREATE TABLE "Inference" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "name" TEXT,
    "model" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "outputJson" JSONB,
    "inputMessages" JSONB NOT NULL,
    "userMessage" TEXT,
    "systemMessage" TEXT,
    "numInputTokens" INTEGER NOT NULL,
    "numOutputTokens" INTEGER NOT NULL,
    "latencySeconds" DOUBLE PRECISION NOT NULL,
    "skippedCache" BOOLEAN NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "tracerUuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inference_cacheKey_createdAt_idx" ON "Inference"("cacheKey", "createdAt" DESC);
