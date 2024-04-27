import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../clients";

async function setCacheKey(key: string, value: any): Promise<void> {
  try {
    const cache = await prisma.generalCache.findUnique({
      where: { cacheKey: key },
    });
    if (cache) {
      await prisma.generalCache.update({
        where: { cacheKey: key },
        data: { value: JSON.stringify(value), updatedAt: new Date() },
      });
    } else {
      await prisma.generalCache.create({
        data: { cacheKey: key, value: JSON.stringify(value) },
      });
    }
  } catch (error) {
    console.error("Error setting cache key:", error);
  }
}

async function getCacheKey(key: string): Promise<any | null> {
  try {
    const cache = await prisma.generalCache.findUnique({
      where: { cacheKey: key },
    });
    if (cache) {
      return JSON.parse(cache.value);
    }
    return null;
  } catch (error) {
    console.error("Error getting cache key:", error);
    return null;
  }
}

function cacheForKeyAsync<P extends any[], R>(
  prefix: string,
  keyFn?: (...args: P) => string
): (func: (...args: P) => Promise<R>) => (...args: P) => Promise<R> {
  return function decorator(
    func: (...args: P) => Promise<R>
  ): (...args: P) => Promise<R> {
    return async function wrapper(...args: P): Promise<R> {
      let hash: string | undefined;
      if (keyFn) {
        const rawCustomKey = keyFn(...args);
        hash = crypto.createHash("sha256").update(rawCustomKey).digest("hex");
      } else {
        const serializedArgs = JSON.stringify(args);
        hash = crypto.createHash("sha256").update(serializedArgs).digest("hex");
        console.log("HASH");
      }
      const key = prefix + hash;

      const result = await getCacheKey(key);
      if (result === null) {
        const computedResult = await func(...args);
        await setCacheKey(key, computedResult);
        return computedResult;
      }
      return result;
    };
  };
}

export { setCacheKey, getCacheKey, cacheForKeyAsync };
