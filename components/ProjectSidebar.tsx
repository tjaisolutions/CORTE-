
import React, { useState } from 'react';
import { Project } from '../types';
import { IconFolder, IconPlusCircle } from './Icons';

interface ProjectSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: (name: string, clientName: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ projects, activeProjectId, onSelectProject, onCreateProject }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName) {
      onCreateProject(newProjectName, newClientName);
      setNewProjectName('');
      setNewClientName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full md:w-64 bg-stark-900 border-r border-stark-border flex flex-col h-full rounded-l-xl">
      <div className="p-4 border-b border-stark-border">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Workspaces</h3>
        
        <button 
          onClick={() => onSelectProject(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-2 flex items-center gap-2 transition-colors ${activeProjectId === null ? 'bg-stark-800 text-white' : 'text-slate-400 hover:text-white hover:bg-stark-800/50'}`}
        >
          <IconFolder className="w-4 h-4" />
          Todos os Cortes
        </button>

        <div className="space-y-1">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors group ${activeProjectId === project.id ? 'bg-stark-800 text-white' : 'text-slate-400 hover:text-white hover:bg-stark-800/50'}`}
            >
              <span className={`w-2 h-2 rounded-full ${project.color}`}></span>
              <span className="truncate flex-1">{project.name}</span>
              <span className="text-[10px] bg-stark-950 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{project.clipCount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-stark-border">
        {isCreating ? (
          <form onSubmit={handleSubmit} className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <input 
              type="text" 
              placeholder="Nome do Projeto"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full bg-stark-950 border border-stark-border rounded px-2 py-1.5 text-xs text-white focus:border-stark-accent focus:outline-none"
              autoFocus
            />
            <input 
              type="text" 
              placeholder="Cliente (Opcional)"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full bg-stark-950 border border-stark-border rounded px-2 py-1.5 text-xs text-white focus:border-stark-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-stark-800 text-slate-400 text-[10px] py-1 rounded hover:text-white"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-stark-accent text-white text-[10px] py-1 rounded hover:bg-blue-600"
              >
                Criar
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full py-2 border border-dashed border-stark-border rounded-lg text-xs text-slate-500 hover:text-stark-accent hover:border-stark-accent transition-colors flex items-center justify-center gap-2"
          >
            <IconPlusCircle className="w-4 h-4" />
            Novo Projeto
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
