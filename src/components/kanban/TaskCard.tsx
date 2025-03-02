
import React from "react";
import { CalendarIcon, UserCircle } from "lucide-react";

export type TaskType = "Tax Filing" | "Audit" | "Consultation" | "Bookkeeping" | "Payroll";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type Task = {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  clientName?: string;
  deadline?: string;
  priority: Priority;
  assignedTo?: string;
};

interface TaskCardProps {
  task: Task;
  columnId: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => void;
}

export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "Low":
      return "bg-blue-100 text-blue-800";
    case "Medium":
      return "bg-green-100 text-green-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Urgent":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTaskTypeColor = (taskType: TaskType) => {
  switch (taskType) {
    case "Tax Filing":
      return "bg-purple-100 text-purple-800";
    case "Audit":
      return "bg-amber-100 text-amber-800";
    case "Consultation":
      return "bg-sky-100 text-sky-800";
    case "Bookkeeping":
      return "bg-indigo-100 text-indigo-800";
    case "Payroll":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onDragStart }) => {
  return (
    <div
      key={task.id}
      className="bg-white p-3 rounded-md shadow-sm border border-slate-200 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, task.id, columnId)}
    >
      <h4 className="font-medium mb-2">{task.title}</h4>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getTaskTypeColor(task.taskType)}`}>
          {task.taskType}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <p className="text-xs text-slate-600 mb-2">
          {task.description}
        </p>
      )}
      
      <div className="text-xs space-y-1 text-slate-500">
        {task.clientName && (
          <div className="flex items-center gap-1">
            <span>Client:</span>
            <span className="font-medium">{task.clientName}</span>
          </div>
        )}
        
        {task.deadline && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}
        
        {task.assignedTo && (
          <div className="flex items-center gap-1 mt-2">
            <UserCircle className="h-3 w-3" />
            <span>{task.assignedTo}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
