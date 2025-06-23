# AI Todo App

An interactive todo application powered by AI toolcalls that allows users to manage their tasks through a conversational chatbot interface.

## Features

- **AI-Powered Chat Interface**: Manage todos through natural language conversations
- **CRUD Operations**: Create, read, update, and delete todos via AI commands
- **Smart Filtering**: Filter todos by completion status and priority levels
- **Real-time Updates**: Automatic UI updates after AI operations
- **MongoDB Integration**: Persistent data storage
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-3.5-turbo with AI SDK toolcalls
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API key

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-todo-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your values:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai-todo
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**: Navigate to `http://localhost:3000`

## Usage

### Traditional Interface
- Use the form to add new todos manually
- Click the checkboxes to mark todos as complete
- Use filter buttons to view specific sets of todos
- Delete todos using the trash icon

### AI Chat Interface
- Click the chat bubble icon in the bottom-right corner
- Use natural language to manage your todos:

**Example Commands**:
- "Add a high priority todo to buy groceries"
- "Create a task to finish the project report with medium priority"
- "Show me all completed todos"
- "Mark the grocery shopping task as completed"
- "Delete all completed todos"
- "List all high priority pending tasks"

## AI Toolcalls

The chatbot can perform the following operations:

- **createTodo**: Create new todo items
- **getTodos**: Retrieve and filter existing todos
- **updateTodo**: Modify todo properties (title, description, status, priority)
- **deleteTodo**: Remove todo items

## API Endpoints

- `GET /api/todos` - Fetch todos (with optional filtering)
- `POST /api/todos` - Create new todo
- `PUT /api/todos/[id]` - Update specific todo
- `DELETE /api/todos/[id]` - Delete specific todo
- `POST /api/chat` - AI chat with toolcalls

## Project Structure

```
ai-todo-app/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # AI chat endpoint
│   │   └── todos/
│   │       ├── route.ts           # Todo CRUD operations
│   │       └── [id]/route.ts      # Individual todo operations
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── lib/
│   └── mongodb.ts                 # Database connection
├── models/
│   └── Todo.ts                    # Todo data model
├── types/
│   └── global.d.ts               # Global type definitions
└── configuration files...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Demo Screenshots

The application demonstrates how AI can handle UI actions including:
- Creating todos with natural language
- Filtering and searching todos
- Updating todo status and properties
- Batch operations on multiple todos

Perfect for showcasing AI-powered user interfaces and toolcall implementations! 