
import React from "react";
import TaskCard, { Task } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div key={id} className="space-y-4">
      <div className="bg-slate-100 p-4 rounded-md">
        <h3 className="font-medium text-slate-900 mb-2">
          {title} ({tasks.length})
        </h3>
        <div
          className="space-y-3 min-h-[200px]"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, id)}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={id}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
