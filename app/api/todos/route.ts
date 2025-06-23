import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const priority = searchParams.get('priority');

    let query: any = {};

    if (filter === 'completed') {
      query.completed = true;
    } else if (filter === 'pending') {
      query.completed = false;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { title, description, priority = 'medium' } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const todo = new Todo({
      title,
      description,
      priority,
      completed: false,
    });

    await todo.save();

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
