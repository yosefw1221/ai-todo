import { TodoController } from '@/controllers/todoController';

// Add checklist item
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { text } = await request.json();

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: 'Item text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await TodoController.addChecklistItem(params.id, text);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
