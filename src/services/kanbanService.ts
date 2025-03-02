
import { supabase } from "@/integrations/supabase/client";
import { TaskType, Priority } from "@/components/kanban/TaskCard";

export interface KanbanColumn {
  id: string;
  title: string;
  order_index: number;
  tasks: KanbanTask[];
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string | null;
  task_type: TaskType;
  client_name: string | null;
  deadline: string | null;
  priority: Priority;
  assigned_to: string | null;
  column_id: string;
  order_index: number;
}

export interface NewKanbanTask {
  title: string;
  description?: string | null;
  task_type: TaskType;
  client_name?: string | null;
  deadline?: string | null;
  priority: Priority;
  assigned_to?: string | null;
  column_id: string;
  order_index: number;
}

export interface UpdateKanbanTask {
  id: string;
  title?: string;
  description?: string | null;
  task_type?: TaskType;
  client_name?: string | null;
  deadline?: string | null;
  priority?: Priority;
  assigned_to?: string | null;
  column_id?: string;
  order_index?: number;
}

export const kanbanService = {
  /**
   * Fetch all Kanban columns with their tasks
   */
  async getKanbanBoard(): Promise<KanbanColumn[]> {
    // Fetch columns
    const { data: columns, error: columnsError } = await supabase
      .from("kanban_columns")
      .select("*")
      .order("order_index");

    if (columnsError) {
      console.error("Error fetching kanban columns:", columnsError);
      throw columnsError;
    }

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("kanban_tasks")
      .select("*")
      .order("order_index");

    if (tasksError) {
      console.error("Error fetching kanban tasks:", tasksError);
      throw tasksError;
    }

    // Group tasks by column
    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id) || [],
    }));

    return columnsWithTasks;
  },

  /**
   * Create a new Kanban column
   */
  async createColumn(title: string, order_index: number): Promise<string> {
    const { data, error } = await supabase
      .from("kanban_columns")
      .insert({ title, order_index })
      .select()
      .single();

    if (error) {
      console.error("Error creating kanban column:", error);
      throw error;
    }

    return data.id;
  },

  /**
   * Update a Kanban column
   */
  async updateColumn(id: string, title: string, order_index: number): Promise<void> {
    const { error } = await supabase
      .from("kanban_columns")
      .update({ title, order_index })
      .eq("id", id);

    if (error) {
      console.error("Error updating kanban column:", error);
      throw error;
    }
  },

  /**
   * Delete a Kanban column
   */
  async deleteColumn(id: string): Promise<void> {
    const { error } = await supabase
      .from("kanban_columns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting kanban column:", error);
      throw error;
    }
  },

  /**
   * Create a new Kanban task
   */
  async createTask(task: NewKanbanTask): Promise<string> {
    const { data, error } = await supabase
      .from("kanban_tasks")
      .insert(task)
      .select()
      .single();

    if (error) {
      console.error("Error creating kanban task:", error);
      throw error;
    }

    return data.id;
  },

  /**
   * Update a Kanban task
   */
  async updateTask(task: UpdateKanbanTask): Promise<void> {
    const { error } = await supabase
      .from("kanban_tasks")
      .update(task)
      .eq("id", task.id);

    if (error) {
      console.error("Error updating kanban task:", error);
      throw error;
    }
  },

  /**
   * Delete a Kanban task
   */
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from("kanban_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting kanban task:", error);
      throw error;
    }
  },

  /**
   * Move a task to a different column
   */
  async moveTask(taskId: string, newColumnId: string, newOrderIndex: number): Promise<void> {
    const { error } = await supabase
      .from("kanban_tasks")
      .update({ column_id: newColumnId, order_index: newOrderIndex })
      .eq("id", taskId);

    if (error) {
      console.error("Error moving kanban task:", error);
      throw error;
    }
  },

  /**
   * Reorder tasks within a column
   */
  async reorderTasks(tasks: { id: string; order_index: number }[]): Promise<void> {
    // Create a batch update
    const updates = tasks.map(({ id, order_index }) => ({
      id,
      order_index,
    }));

    // Perform updates one by one
    for (const update of updates) {
      const { error } = await supabase
        .from("kanban_tasks")
        .update({ order_index: update.order_index })
        .eq("id", update.id);

      if (error) {
        console.error("Error reordering kanban tasks:", error);
        throw error;
      }
    }
  },
}; 
