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

The chatbot uses a modular tool system with the following operations:

- **createTodo**: Create new todo items with checklist support
- **getTodos**: Retrieve and filter existing todos
- **updateTodo**: Modify todo properties (title, description, status, priority)
- **deleteTodo**: Remove individual todo items
- **deleteMultipleTodos**: Bulk deletion of multiple todos
- **getTodoChecklists**: Retrieve checklist items for a specific todo
- **updateTodoChecklistItem**: Update individual checklist items

All tools are organized in the `tools/` directory for better maintainability and code organization.

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
│   │   ├── chat/route.ts          # AI chat endpoint (routes to ChatController)
│   │   └── todos/
│   │       ├── route.ts           # Todo CRUD operations (routes to TodoController)
│   │       └── [id]/route.ts      # Individual todo operations (routes to TodoController)
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout with DB initialization
│   └── page.tsx                   # Main application page
├── controllers/
│   ├── chatController.ts          # AI chat business logic (imports from tools/)
│   └── todoController.ts          # Todo business logic and database operations
├── tools/                         # AI tool definitions (modular structure)
│   ├── createTodo.ts              # Create todo with checklist support
│   ├── getTodos.ts                # Retrieve todos with filtering
│   ├── updateTodo.ts              # Update todo properties
│   ├── deleteTodo.ts              # Delete single todo
│   ├── deleteMultipleTodos.ts     # Bulk todo deletion
│   ├── getTodoChecklists.ts       # Get checklist items
│   ├── updateTodoChecklistItem.ts # Update checklist items
│   └── index.ts                   # Tool exports and convenience object
├── lib/
│   └── db.ts                      # Database connection with startup initialization
├── models/
│   └── Todo.ts                    # Todo data model (Mongoose schema)
├── services/
│   └── todoService.ts             # Frontend API service layer
├── types/
│   └── todo.ts                    # Todo type definitions
├── utils/
│   └── constants.ts               # App constants and configuration
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