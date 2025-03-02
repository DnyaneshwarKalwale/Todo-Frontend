// TodoCard.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, FileText, MoreHorizontal } from 'lucide-react';
import { Todo } from '../types';

interface TodoCardProps {
  todo: Todo;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm p-4 mb-3 cursor-grab"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
          {todo.priority}
        </span>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <h3 className="font-semibold text-lg mb-1">{todo.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{todo.description}</p>
      
      <div className="flex items-center space-x-3 text-gray-500">
        <div className="flex items-center">
          <MessageSquare size={14} className="mr-1" />
          <span className="text-xs">{todo.comments || 0}</span>
        </div>
        <div className="flex items-center">
          <FileText size={14} className="mr-1" />
          <span className="text-xs">{todo.files || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;