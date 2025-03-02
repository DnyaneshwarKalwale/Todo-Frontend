// types.ts
export interface Todo {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'On Progress' | 'Done';
  project: string;
  user: string;
  comments?: number;
  files?: number;
  assignees?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  user: string;
  todos: Todo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
}