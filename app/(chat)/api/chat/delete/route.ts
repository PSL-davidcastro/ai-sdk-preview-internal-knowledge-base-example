import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById } from "@/app/db";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Chat ID is required", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if the chat exists and belongs to the user
  const chat = await getChatById({ id });

  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  if (chat.author !== session.user.email) {
    return new Response("Unauthorized", { status: 403 });
  }

  // Delete the chat
  await deleteChatById({ id });

  return Response.json({ success: true });
}
