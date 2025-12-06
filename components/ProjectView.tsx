import React, { useState } from 'react';
import { Project } from '../types';
import { ExternalLink, RefreshCw, AlertTriangle, Github } from 'lucide-react';

interface ProjectViewProps {
  project: Project;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshIframe = () => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Toolbar */}
      <div className="h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50">
        <div className="flex items-center gap-2 text-sm text-slate-400">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span>Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={refreshIframe}
             className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
             title="Reload Frame"
           >
             <RefreshCw size={14} />
           </button>
           <div className="h-4 w-px bg-slate-700 mx-1"></div>
           <a 
             href={project.githubUrl}
             target="_blank"
             rel="noreferrer"
             className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors text-xs font-medium"
           >
             <Github size={14} /> Code
           </a>
           <a 
             href={project.demoUrl}
             target="_blank"
             rel="noreferrer"
             className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors text-xs font-medium shadow-sm"
           >
             Open New Tab <ExternalLink size={14} />
           </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow relative bg-slate-950">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm z-10">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="w-full h-full flex flex-col">
            <div className="bg-amber-900/20 border-b border-amber-900/50 p-2 text-center text-xs text-amber-200/80 flex items-center justify-center gap-2">
                <AlertTriangle size={12} />
                Some sites may block embedding (X-Frame-Options). If the preview is blank, use the "Open New Tab" button.
            </div>
            <iframe 
                key={iframeKey}
                src={project.demoUrl} 
                className="w-full h-full border-0 bg-white"
                title={`${project.title} Preview`}
                onLoad={() => setLoading(false)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
        </div>
      </div>
    </div>
  );
};
