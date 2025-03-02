import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import NewTaskForm from "@/components/kanban/NewTaskForm";
import { Task, TaskType, Priority } from "@/components/kanban/TaskCard";
import { Column, initialColumns } from "@/components/kanban/KanbanData";
import KanbanBoard from "@/components/kanban/KanbanBoard";

const Kanban = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("Consultation");
  const [newTaskClient, setNewTaskClient] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("Medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("backlog");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string,
    columnId: string
  ) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ taskId, columnId })
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("application/json"));
    const { taskId, columnId: sourceColumnId } = data;

    if (sourceColumnId === columnId) return;

    setColumns((prevColumns) => {
      // Find the source column and task
      const sourceColumn = prevColumns.find((col) => col.id === sourceColumnId);
      if (!sourceColumn) return prevColumns;

      const taskIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === taskId
      );
      if (taskIndex === -1) return prevColumns;

      // Get the task from source column
      const task = sourceColumn.tasks[taskIndex];

      // Remove the task from source column
      const newSourceTasks = [...sourceColumn.tasks];
      newSourceTasks.splice(taskIndex, 1);

      // Add the task to target column
      return prevColumns.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, tasks: newSourceTasks };
        }
        if (col.id === columnId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      });
    });
  };

  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      taskType: newTaskType,
      clientName: newTaskClient || undefined,
      deadline: newTaskDeadline || undefined,
      priority: newTaskPriority,
      assignedTo: newTaskAssignee || undefined,
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === newTaskColumn) {
          return { ...col, tasks: [...col.tasks, newTask] };
        }
        return col;
      })
    );

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskClient("");
    setNewTaskDeadline("");
    setNewTaskAssignee("");
    setShowNewTaskForm(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Workflow Kanban
              </h1>
              <p className="text-slate-500 mt-1">
                Manage and track your team's tasks
              </p>
            </div>
            <Button
              className="bg-black hover:bg-slate-800"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </header>

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

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </main> */}

        <KanbanBoard />
      </div>
    </div>
  );
};

export default Kanban;
