import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { createMessage } from "@/app/db";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { id, messages, selectedFilePathnames } = await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = streamText({
    model: customModel,
    system:
      "You are a helpful assistant that ONLY answers questions based on the provided document content. You must strictly follow these rules: 1) NEVER use information outside of the provided context, 2) If the provided information doesn't contain the answer, clearly state that you don't have enough information in the documents, 3) Do not make assumptions or provide general knowledge, 4) Only reference and use information that is explicitly provided in the document context.",
    messages,
    experimental_providerMetadata: {
      files: {
        selection: selectedFilePathnames,
      },
    },
    onFinish: async ({ text }) => {
      await createMessage({
        id,
        messages: [...messages, { role: "assistant", content: text }],
        author: session.user?.email!,
      });
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}
