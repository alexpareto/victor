import * as crypto from "crypto";
import { oai_client } from "@/clients";
import { getCacheKey, setCacheKey } from "./cache";

function cacheKeyForText(text: string): string {
  // sha256 hash of text
  return (
    "text-embedding:" + crypto.createHash("sha256").update(text).digest("hex")
  );
}

export async function embedTexts(
  texts: string[]
): Promise<(number[] | null)[]> {
  const outputEmbeddings: (number[] | null)[] = new Array(texts.length).fill(
    null
  );

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const embedding = await getCacheKey(cacheKeyForText(text));
    if (embedding) {
      outputEmbeddings[i] = embedding;
    }
  }

  const textsToEmbed = texts.filter((_, i) => outputEmbeddings[i] === null);

  if (textsToEmbed.length > 0) {
    const embeddingsResult = await oai_client.embeddings.create({
      input: textsToEmbed,
      model: "text-embedding-3-large",
      dimensions: 1024,
    });

    const calculatedEmbeddings = embeddingsResult.data.map((d) => d.embedding);

    let j = 0;
    for (let i = 0; i < outputEmbeddings.length; i++) {
      if (outputEmbeddings[i] === null) {
        outputEmbeddings[i] = calculatedEmbeddings[j];
        await setCacheKey(cacheKeyForText(texts[i]), outputEmbeddings[i]);
        j++;
      }
    }
  }

  return outputEmbeddings;
}
