
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Task, TaskType, Priority } from "./TaskCard";

interface NewTaskFormProps {
  newTaskTitle: string;
  setNewTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  newTaskDescription: string;
  setNewTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  newTaskType: TaskType;
  setNewTaskType: React.Dispatch<React.SetStateAction<TaskType>>;
  newTaskClient: string;
  setNewTaskClient: React.Dispatch<React.SetStateAction<string>>;
  newTaskDeadline: string;
  setNewTaskDeadline: React.Dispatch<React.SetStateAction<string>>;
  newTaskPriority: Priority;
  setNewTaskPriority: React.Dispatch<React.SetStateAction<Priority>>;
  newTaskAssignee: string;
  setNewTaskAssignee: React.Dispatch<React.SetStateAction<string>>;
  newTaskColumn: string;
  setNewTaskColumn: React.Dispatch<React.SetStateAction<string>>;
  columns: Array<{ id: string; title: string; tasks: Task[] }>;
  addNewTask: () => void;
  setShowNewTaskForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskType,
  setNewTaskType,
  newTaskClient,
  setNewTaskClient,
  newTaskDeadline,
  setNewTaskDeadline,
  newTaskPriority,
  setNewTaskPriority,
  newTaskAssignee,
  setNewTaskAssignee,
  newTaskColumn,
  setNewTaskColumn,
  columns,
  addNewTask,
  setShowNewTaskForm,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Add New Task</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewTaskForm(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Task Title*
              </label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskType" className="text-sm font-medium">
                Task Type*
              </label>
              <select
                id="taskType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value as TaskType)}
              >
                <option value="Tax Filing">Tax Filing</option>
                <option value="Audit">Audit</option>
                <option value="Consultation">Consultation</option>
                <option value="Bookkeeping">Bookkeeping</option>
                <option value="Payroll">Payroll</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="client" className="text-sm font-medium">
                Client Name
              </label>
              <Input
                id="client"
                placeholder="Client name (if applicable)"
                value={newTaskClient}
                onChange={(e) => setNewTaskClient(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                Deadline
              </label>
              <Input
                id="deadline"
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority*
              </label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="assignee" className="text-sm font-medium">
                Assigned To
              </label>
              <Input
                id="assignee"
                placeholder="Worker name"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Task description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="column" className="text-sm font-medium">
              Column*
            </label>
            <select
              id="column"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newTaskColumn}
              onChange={(e) => setNewTaskColumn(e.target.value)}
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="w-full bg-black hover:bg-slate-800"
            onClick={addNewTask}
          >
            Add Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewTaskForm;
