import { NextRequest, NextResponse } from 'next/server';
import { TodoController } from '@/controllers/todoController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') as
    | 'all'
    | 'completed'
    | 'pending'
    | null;
  const priority = searchParams.get('priority') as
    | 'all'
    | 'low'
    | 'medium'
    | 'high'
    | null;

  const result = await TodoController.getAllTodos({
    filter: filter || 'all',
    priority: priority || 'all',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ todos: result.todos });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority } = body;

    const result = await TodoController.createTodo({
      title,
      description,
      priority,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ todo: result.todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
