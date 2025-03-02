
import React, { useState, useEffect } from "react";
import KanbanColumn from "./KanbanColumn";
import NewTaskForm from "./NewTaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { kanbanService, KanbanColumn as KanbanColumnType, KanbanTask as KanbanTaskType, NewKanbanTask } from "@/services/kanbanService";
import { useToast } from "@/components/ui/use-toast";
import { Task, TaskType, Priority } from "./TaskCard";

// Interface for the UI columns
interface UIColumn {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<UIColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const { toast } = useToast();

  // Form state for new task
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("Consultation");
  const [newTaskClient, setNewTaskClient] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("Medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("");

  useEffect(() => {
    fetchKanbanBoard();
  }, []);

  // Convert KanbanTask to Task format for the UI components
  const mapKanbanTaskToTask = (kanbanTask: KanbanTaskType): Task => {
    return {
      id: kanbanTask.id,
      title: kanbanTask.title,
      description: kanbanTask.description || "",
      taskType: kanbanTask.task_type,
      clientName: kanbanTask.client_name || undefined,
      deadline: kanbanTask.deadline || undefined,
      priority: kanbanTask.priority,
      assignedTo: kanbanTask.assigned_to || undefined,
    };
  };

  const fetchKanbanBoard = async () => {
    try {
      setLoading(true);
      const data = await kanbanService.getKanbanBoard();
      
      // Map the data to the format expected by the UI components
      const mappedColumns = data.map(column => ({
        id: column.id,
        title: column.title,
        tasks: column.tasks.map(mapKanbanTaskToTask)
      }));
      
      setColumns(mappedColumns);
      
      // Set default column for new task if columns exist
      if (data.length > 0 && !newTaskColumn) {
        setNewTaskColumn(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching kanban board:", error);
      toast({
        title: "Error",
        description: "Failed to load kanban board",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceColumnId", columnId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");

    if (sourceColumnId === targetColumnId) return;

    try {
      // Find the highest order_index in the target column
      const targetColumn = columns.find((col) => col.id === targetColumnId);
      if (!targetColumn) return;

      // Get the original data from the database to find the order index
      const kanbanData = await kanbanService.getKanbanBoard();
      const targetKanbanColumn = kanbanData.find(col => col.id === targetColumnId);
      
      if (!targetKanbanColumn) return;
      
      const highestOrderIndex = targetKanbanColumn.tasks.length > 0
        ? Math.max(...targetKanbanColumn.tasks.map(task => task.order_index))
        : 0;
      
      // New order index will be one more than the highest
      const newOrderIndex = highestOrderIndex + 1;

      // Update in the database
      await kanbanService.moveTask(taskId, targetColumnId, newOrderIndex);

      // Update local state
      setColumns(prevColumns => {
        // Create a deep copy of the columns
        const newColumns = JSON.parse(JSON.stringify(prevColumns));
        
        // Find the task in the source column
        const sourceColumn = newColumns.find((col: UIColumn) => col.id === sourceColumnId);
        const taskIndex = sourceColumn.tasks.findIndex((task: Task) => task.id === taskId);
        
        if (taskIndex === -1) return prevColumns;
        
        // Remove the task from the source column
        const [task] = sourceColumn.tasks.splice(taskIndex, 1);
        
        // Add the task to the target column
        const targetColumn = newColumns.find((col: UIColumn) => col.id === targetColumnId);
        targetColumn.tasks.push(task);
        
        return newColumns;
      });

      toast({
        title: "Success",
        description: "Task moved successfully",
      });
    } catch (error) {
      console.error("Error moving task:", error);
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
    }
  };

  const addNewTask = async () => {
    if (!newTaskTitle || !newTaskType || !newTaskPriority || !newTaskColumn) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the target column in the original data
      const kanbanData = await kanbanService.getKanbanBoard();
      const targetKanbanColumn = kanbanData.find(col => col.id === newTaskColumn);
      
      if (!targetKanbanColumn) return;

      // Calculate the new order index
      const highestOrderIndex = targetKanbanColumn.tasks.length > 0
        ? Math.max(...targetKanbanColumn.tasks.map(task => task.order_index))
        : 0;
      
      const newOrderIndex = highestOrderIndex + 1;

      // Create the new task object
      const newTask: NewKanbanTask = {
        title: newTaskTitle,
        description: newTaskDescription || null,
        task_type: newTaskType,
        client_name: newTaskClient || null,
        deadline: newTaskDeadline || null,
        priority: newTaskPriority,
        assigned_to: newTaskAssignee || null,
        column_id: newTaskColumn,
        order_index: newOrderIndex,
      };

      // Add to database
      const taskId = await kanbanService.createTask(newTask);

      // Update local state
      setColumns(prevColumns => {
        const newColumns = JSON.parse(JSON.stringify(prevColumns));
        const targetColumn = newColumns.find((col: UIColumn) => col.id === newTaskColumn);
        
        // Convert to Task format
        const newUITask: Task = {
          id: taskId,
          title: newTaskTitle,
          description: newTaskDescription,
          taskType: newTaskType,
          clientName: newTaskClient || undefined,
          deadline: newTaskDeadline || undefined,
          priority: newTaskPriority,
          assignedTo: newTaskAssignee || undefined,
        };
        
        targetColumn.tasks.push(newUITask);
        
        return newColumns;
      });

      // Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskClient("");
      setNewTaskDeadline("");
      setNewTaskAssignee("");
      setShowNewTaskForm(false);

      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showNewTaskForm && (
        <NewTaskForm
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDescription={newTaskDescription}
          setNewTaskDescription={setNewTaskDescription}
          newTaskType={newTaskType}
          setNewTaskType={setNewTaskType}
          newTaskClient={newTaskClient}
          setNewTaskClient={setNewTaskClient}
          newTaskDeadline={newTaskDeadline}
          setNewTaskDeadline={setNewTaskDeadline}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          newTaskAssignee={newTaskAssignee}
          setNewTaskAssignee={setNewTaskAssignee}
          newTaskColumn={newTaskColumn}
          setNewTaskColumn={setNewTaskColumn}
          columns={columns}
          addNewTask={addNewTask}
          setShowNewTaskForm={setShowNewTaskForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={column.tasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
