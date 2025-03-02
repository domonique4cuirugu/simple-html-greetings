
import { Task } from "./TaskCard";

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    tasks: [
      {
        id: "task-1",
        title: "Contact new client",
        description: "Reach out to Smith & Co. about their tax requirements.",
        taskType: "Consultation",
        clientName: "Smith & Co.",
        deadline: "2023-07-15",
        priority: "Medium",
        assignedTo: "Sarah Johnson",
      },
      {
        id: "task-2",
        title: "Prepare quarterly reports",
        description: "Finalize Q1 financial reports for Johnson LLC.",
        taskType: "Bookkeeping",
        clientName: "Johnson LLC",
        deadline: "2023-07-20",
        priority: "High",
        assignedTo: "Michael Davis",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "task-3",
        title: "Review tax documents",
        description: "Check tax documentation for ABC Corporation.",
        taskType: "Tax Filing",
        clientName: "ABC Corporation",
        deadline: "2023-07-10",
        priority: "High",
        assignedTo: "Emma Wilson",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    tasks: [
      {
        id: "task-4",
        title: "Internal audit",
        description: "Complete internal audit for XYZ Enterprises.",
        taskType: "Audit",
        clientName: "XYZ Enterprises",
        deadline: "2023-07-05",
        priority: "Urgent",
        assignedTo: "Robert Brown",
      },
    ],
  },
  {
    id: "complete",
    title: "Complete",
    tasks: [
      {
        id: "task-5",
        title: "File annual returns",
        description: "Submit annual returns for Davis Accounting.",
        taskType: "Tax Filing",
        clientName: "Davis Accounting",
        deadline: "2023-06-30",
        priority: "High",
        assignedTo: "Jennifer Lee",
      },
    ],
  },
];
