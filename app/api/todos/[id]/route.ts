import { NextRequest, NextResponse } from 'next/server';
import { TodoController } from '@/controllers/todoController';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await TodoController.getTodoById(params.id);

  if (!result.success) {
    const status = result.error === 'Todo not found' ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ todo: result.todo });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, completed, priority } = body;

    const result = await TodoController.updateTodo(params.id, {
      title,
      description,
      completed,
      priority,
    });

    if (!result.success) {
      const status = result.error === 'Todo not found' ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ todo: result.todo });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await TodoController.deleteTodo(params.id);

  if (!result.success) {
    const status = result.error === 'Todo not found' ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ message: result.message });
}
