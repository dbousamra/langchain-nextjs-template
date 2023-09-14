import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const runtime = "nodejs";

// // Before running, follow set-up instructions at
// // https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

// /**
//  * This handler takes input text, splits it into chunks, and embeds those chunks
//  * into a vector store for later retrieval. See the following docs for more information:
//  *
//  * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
//  * https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/supabase
//  */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = await JSON.parse(req.body);
  console.log(body.text);

  try {
    const loader = new GithubRepoLoader(body.text, {
      branch: "main",
      recursive: true,
      unknown: "warn",
      verbose: true,
      maxConcurrency: 1,
      ignoreFiles: ["*.ts", "*.js", "*.json"],
      onFailedAttempt: (err) => {
        console.log(err);
      },
    });

    console.log("beginning load");
    const docs = await loader.loadAndSplit();
    console.log("finishing load");

    console.log(docs);

    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!,
    );

    await SupabaseVectorStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
