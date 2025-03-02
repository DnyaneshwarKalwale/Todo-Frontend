import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TodoColumn from './components/TodoColumn';
import TodoCard from './components/TodoCard';
import AddTodoModal from './components/AddTodoModal';
import AddProjectModal from './components/AddProjectModal';
import { Todo, Project } from './types';

const API_BASE_URL = 'https://todo-app-backend-48z7.onrender.com/api';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [addTodoModal, setAddTodoModal] = useState<{ isOpen: boolean; status: string }>({
    isOpen: false,
    status: 'To Do'
  });
  const [addProjectModal, setAddProjectModal] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (token) {
          const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProjects(response.data);
          setActiveProject(response.data[0] || null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, [token]);

  const filteredTodos = (todos: Todo[] = []) => {
    return todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = selectedPriorities.size === 0 || 
        selectedPriorities.has(todo.priority);
      
      return matchesSearch && matchesPriority;
    });
  };

  const togglePriorityFilter = (priority: string) => {
    setSelectedPriorities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(priority)) {
        newSet.delete(priority);
      } else {
        newSet.add(priority);
      }
      return newSet;
    });
  };

  // Authentication handlers
  const handleRegister = async (email: string, password: string) => {
    try {
      const response = await axios.post<{ token: string }>(
        `${API_BASE_URL}/register`, 
        { email, password }
      );
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', email);
      setToken(response.data.token);
      setUserEmail(email);
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post<{ token: string }>(
        `${API_BASE_URL}/login`,
        { email, password }
      );
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', email);
      setToken(response.data.token);
      setUserEmail(email);
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    setProjects([]);
    setActiveProject(null);
  };

  // Project handlers
  const handleAddProject = async (project: Omit<Project, '_id' | 'user' | 'todos'>) => {
    try {
      const response = await axios.post<Project>(
        `${API_BASE_URL}/projects`,
        { name: project.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([...projects, response.data]);
      setActiveProject(response.data);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Todo handlers
  const handleAddTodo = async (todo: Omit<Todo, '_id' | 'project' | 'user'>) => {
    if (!activeProject?._id) return;
    
    try {
      const response = await axios.post<Todo>(
        `${API_BASE_URL}/todos/${activeProject._id}`,
        {
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          status: todo.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedProjects = projects.map(project => 
        project._id === activeProject._id ? 
        { ...project, todos: [...(project.todos || []), response.data] } : project
      );
      
      setProjects(updatedProjects);
      setActiveProject(prev => prev ? 
        { ...prev, todos: [...(prev.todos || []), response.data] } : null
      );
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  // Drag and drop handlers
  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeProject) return;

    const activeTodo = activeProject.todos?.find(t => t._id === active.id);
    if (!activeTodo) return;

    if (['To Do', 'On Progress', 'Done'].includes(over.id as string)) {
      try {
        await axios.patch<Todo>(
          `${API_BASE_URL}/todos/${active.id}`,
          { status: over.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedTodos = activeProject.todos?.map(todo => 
          todo._id === active.id ? { ...todo, status: over.id as Todo['status'] } : todo
        ) || [];

        const updatedProject: Project = { 
          ...activeProject, 
          todos: updatedTodos
        };
        
        setActiveProject(updatedProject);
        setProjects(projects.map(p => p._id === activeProject._id ? updatedProject : p));
      } catch (error) {
        console.error('Error updating todo status:', error);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {token ? (
        <>
          <Sidebar 
            projects={projects}
            activeProject={activeProject}
            onSelectProject={setActiveProject}
            onAddProject={() => setAddProjectModal(true)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              projectName={activeProject?.name || 'Select a Project'}
              userEmail={userEmail}
              onEditProjectName={(name) => {
                const updatedProject = { ...activeProject!, name };
                setActiveProject(updatedProject);
                setProjects(projects.map(p => p._id === activeProject!._id ? updatedProject : p));
              }}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
            />
            
            {activeProject && (
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg
                      className="absolute right-3 top-3 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {['Low', 'Medium', 'High'].map(priority => (
                      <button
                        key={priority}
                        onClick={() => togglePriorityFilter(priority)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedPriorities.has(priority)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {priority} Priority
                      </button>
                    ))}
                    {selectedPriorities.size > 0 && (
                      <button
                        onClick={() => setSelectedPriorities(new Set())}
                        className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                <DndContext
                  sensors={sensors}
                  onDragStart={({ active }) => {
                    setActiveTodo(activeProject.todos?.find(t => t._id === active.id) || null);
                  }}
                  onDragOver={handleDragOver}
                >
                  <div className="flex flex-wrap -mx-2">
                    <TodoColumn
                      title="To Do"
                      todos={filteredTodos(activeProject.todos?.filter(t => t.status === 'To Do'))}
                      count={activeProject.todos?.filter(t => t.status === 'To Do').length || 0}
                      color="bg-purple-500"
                      onAddTodo={(status) => setAddTodoModal({ isOpen: true, status })}
                    />
                    <TodoColumn
                      title="On Progress"
                      todos={filteredTodos(activeProject.todos?.filter(t => t.status === 'On Progress'))}
                      count={activeProject.todos?.filter(t => t.status === 'On Progress').length || 0}
                      color="bg-yellow-500"
                      onAddTodo={(status) => setAddTodoModal({ isOpen: true, status })}
                    />
                    <TodoColumn
                      title="Done"
                      todos={filteredTodos(activeProject.todos?.filter(t => t.status === 'Done'))}
                      count={activeProject.todos?.filter(t => t.status === 'Done').length || 0}
                      color="bg-green-500"
                      onAddTodo={(status) => setAddTodoModal({ isOpen: true, status })}
                    />
                  </div>
                  <DragOverlay>
                    {activeTodo && <TodoCard todo={activeTodo} />}
                  </DragOverlay>
                </DndContext>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-center">
          <Header 
            projectName="Please Login"
            userEmail={null}
            onEditProjectName={() => {}}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
          />
        </div>
      )}

      <AddTodoModal
        isOpen={addTodoModal.isOpen}
        onClose={() => setAddTodoModal({ isOpen: false, status: 'To Do' })}
        onAddTodo={handleAddTodo}
        initialStatus={addTodoModal.status}
      />
      
      <AddProjectModal
        isOpen={addProjectModal}
        onClose={() => setAddProjectModal(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}

export default App;