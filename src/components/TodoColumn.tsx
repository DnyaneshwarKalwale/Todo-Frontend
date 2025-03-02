// TodoColumn.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TodoCard from './TodoCard';
import { Todo } from '../types';

interface TodoColumnProps {
  title: string;
  todos: Todo[];
  count: number;
  color: string;
  onAddTodo: (status: string) => void;
}

const TodoColumn: React.FC<TodoColumnProps> = ({ 
  title, 
  todos, 
  count, 
  color,
  onAddTodo 
}) => {
  const { setNodeRef } = useDroppable({
    id: title,
  });

  return (
    <div className="w-full md:w-1/3 px-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${color} mr-2`}></div>
          <h2 className="font-semibold">{title}</h2>
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <button 
          onClick={() => onAddTodo(title)}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="min-h-[500px] bg-gray-50 rounded-lg p-3"
      >
        <SortableContext 
          items={todos.map(todo => todo._id)} 
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoCard key={todo._id} todo={todo} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default TodoColumn;