import { ChatController } from '@/controllers/chatController';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    return await ChatController.handleChatRequest(messages);
  } catch (error) {
    return new Response('Invalid request', { status: 400 });
  }
}
