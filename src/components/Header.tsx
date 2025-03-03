// Header.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import AuthModal from './AuthModal';

interface HeaderProps {
  projectName: string;
  userEmail: string | null;
  onEditProjectName: (name: string) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  projectName,
  userEmail,
  onEditProjectName,
  onLogin,
  onRegister,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editedName, setEditedName] = useState(projectName);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
      setShowAuth(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className={`${userEmail ? 'bg-white border-b border-gray-200' : 'bg-transparent'} py-4 px-6`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {userEmail ? (
            <>
              {isEditing ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  onEditProjectName(editedName);
                  setIsEditing(false);
                }}>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold border-b-2 border-indigo-500 focus:outline-none"
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                </form>
              ) : (
                <h1 
                  className="text-2xl font-bold cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  {projectName}
                </h1>
              )}
            </>
          ) : (
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Task Management
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {userEmail ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{userEmail}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-full 
                         hover:from-indigo-700 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl
                         font-semibold text-sm"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuth}
        isLogin={isLogin}
        email={email}
        password={password}
        error={authError}
        isLoading={isAuthLoading}
        onClose={() => setShowAuth(false)}
        onToggleAuth={() => setIsLogin(!isLogin)}
        setEmail={setEmail}
        setPassword={setPassword}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
};

export default Header;