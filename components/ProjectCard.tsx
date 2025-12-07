import React from 'react';
import { Project } from '../types';
import { ExternalLink, Github, MonitorPlay, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onDelete: (projectId: string) => void;
  isAdmin: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen, onDelete, isAdmin }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${project.title}" from your portfolio?`)) {
      onDelete(project.id);
    }
  };

  return (
    <div
      className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col h-full"
      onClick={() => onOpen(project)}
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60" />
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {isAdmin && (
            <button
              className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-500 transition-colors"
              onClick={handleDelete}
              title="Remove project"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-colors">
            <MonitorPlay size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {project.title}
          </h3>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded-md border border-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-800 mt-auto">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <Github size={14} />
              <span>Source</span>
            </a>
          )}
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 text-xs font-medium ml-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Live Demo</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
