# Kanban Board with Supabase Integration

This document provides instructions on how to set up and use the Kanban board feature with Supabase as the backend database.

## Database Setup

The Kanban board uses two main tables in Supabase:

1. `kanban_columns` - Stores the columns of the Kanban board
2. `kanban_tasks` - Stores the tasks within each column

### Running the Migration

To set up the necessary tables in your Supabase project:

1. Navigate to the Supabase dashboard for your project
2. Go to the SQL Editor
3. Copy the contents of the `supabase/migrations/20240701_kanban_tables.sql` file
4. Paste it into the SQL Editor and run the query

This will:
- Create the necessary enum types for task types and priorities
- Create the `kanban_columns` and `kanban_tasks` tables
- Set up appropriate indexes and relationships
- Add Row Level Security (RLS) policies
- Insert default columns (Backlog, In Progress, Review, Complete)
- Create triggers to automatically update timestamps

## Using the Kanban Board

### Adding the Kanban Board to a Page

To add the Kanban board to a page in your application:

```tsx
import KanbanBoard from "@/components/kanban/KanbanBoard";

// In your page component:
return (
  <div>
    <h1>Your Page Title</h1>
    <KanbanBoard />
  </div>
);
```

### Features

The Kanban board provides the following features:

1. **View Tasks**: Tasks are displayed in their respective columns
2. **Add Tasks**: Click the "Add Task" button to create a new task
3. **Move Tasks**: Drag and drop tasks between columns
4. **Task Details**: Each task displays its title, description, type, priority, client, deadline, and assignee

### Data Structure

#### Task Types

Tasks can be of the following types:
- Tax Filing
- Audit
- Consultation
- Bookkeeping
- Payroll

#### Priority Levels

Tasks can have the following priority levels:
- Low
- Medium
- High
- Urgent

## Technical Implementation

### Components

- `KanbanBoard.tsx` - Main component that manages the state and interactions
- `KanbanColumn.tsx` - Represents a single column in the Kanban board
- `TaskCard.tsx` - Displays a single task with its details
- `NewTaskForm.tsx` - Form for creating new tasks

### Services

The `kanbanService.ts` file provides methods for interacting with the Supabase database:

- `getKanbanBoard()` - Fetches all columns with their tasks
- `createColumn()` - Creates a new column
- `updateColumn()` - Updates an existing column
- `deleteColumn()` - Deletes a column
- `createTask()` - Creates a new task
- `updateTask()` - Updates an existing task
- `deleteTask()` - Deletes a task
- `moveTask()` - Moves a task to a different column
- `reorderTasks()` - Reorders tasks within a column

## Extending the Kanban Board

### Adding New Task Types

To add new task types:

1. Update the `task_type` enum in the database
2. Update the `TaskType` type in `src/integrations/supabase/types.ts`
3. Update the `getTaskTypeColor` function in `TaskCard.tsx` to include colors for the new types

### Adding New Columns

New columns can be added directly in the Supabase database or by implementing a UI for column management.

### Implementing Task Filtering

To implement filtering, you can modify the `getKanbanBoard` method in the `kanbanService.ts` file to accept filter parameters.

## Troubleshooting

### Tasks Not Appearing

If tasks are not appearing in the Kanban board:

1. Check the browser console for errors
2. Verify that the Supabase client is properly configured
3. Check that the RLS policies are correctly set up to allow reading tasks

### Tasks Not Moving Between Columns

If tasks cannot be moved between columns:

1. Ensure that drag and drop is enabled in your browser
2. Check that the user has permission to update tasks in Supabase
3. Verify that the column IDs are correctly set up in the database 