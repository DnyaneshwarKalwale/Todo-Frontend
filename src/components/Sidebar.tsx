// Sidebar.tsx
import React from 'react';
import { 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Settings, 
  Plus,
  LayoutGrid
} from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProject, 
  onSelectProject,
  onAddProject
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <LayoutGrid className="text-indigo-600 mr-2" size={24} />
          <h1 className="text-xl font-bold">TODO APP</h1>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100">
              <Home size={20} className="mr-3" />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100">
              <MessageSquare size={20} className="mr-3" />
              <span>Messages</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100">
              <CheckSquare size={20} className="mr-3" />
              <span>Tasks</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100">
              <Users size={20} className="mr-3" />
              <span>Members</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100">
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MY PROJECTS</h3>
            <button 
              onClick={onAddProject}
              className="text-gray-500 hover:text-indigo-600"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project._id}>
                <button
                  onClick={() => onSelectProject(project)}
                  className={`flex items-center w-full text-left p-2 rounded-lg ${
                    activeProject?._id === project._id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${
                    activeProject?._id === project._id ? 'bg-indigo-600' : 'bg-gray-400'
                  }`}></span>
                  <span>{project.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;