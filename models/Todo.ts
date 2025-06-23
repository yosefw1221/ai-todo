import mongoose from 'mongoose';

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface ITodo {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  checklist?: IChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new mongoose.Schema<IChecklistItem>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TodoSchema = new mongoose.Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    checklist: {
      type: [ChecklistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Todo ||
  mongoose.model<ITodo>('Todo', TodoSchema);
