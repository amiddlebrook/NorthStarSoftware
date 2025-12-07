import React, { useState, useEffect } from 'react';
import {
  Layout,
  FolderGit2,
  Plus,
  X,
  Github,
  Search,
  Maximize2,
  Grid
} from 'lucide-react';
import { Project, Tab } from './types';
import { INITIAL_PROJECTS, AVATAR_URL } from './constants';
import { ProjectCard } from './components/ProjectCard';
import { AddProjectModal } from './components/AddProjectModal';
import { ProjectView } from './components/ProjectView';

function App() {
  // --- State ---
  // Using a specific namespace key to avoid conflicts if user hosts multiple apps on github.io
  const STORAGE_KEY = 'devshowcase_portfolio_v1_projects';

  const [projects, setProjects] = useState<Project[]>([]);

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Effects ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}projects.json`);
        if (!response.ok) throw new Error('Failed to fetch projects.json');

        const staticProjects: Project[] = await response.json();

        // Fetch local overrides/additions
        const saved = localStorage.getItem(STORAGE_KEY);
        const localProjects: Project[] = saved ? JSON.parse(saved) : [];

        // Merge: Static projects take precedence for their IDs. 
        // We keep local projects only if their ID is NOT in the static set.
        const staticIds = new Set(staticProjects.map(p => p.id));
        const uniqueLocal = localProjects.filter(p => !staticIds.has(p.id));

        setProjects([...staticProjects, ...uniqueLocal]);
      } catch (err) {
        console.warn('Could not load projects.json, falling back to local storage', err);
        const saved = localStorage.getItem(STORAGE_KEY);
        setProjects(saved ? JSON.parse(saved) : INITIAL_PROJECTS);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  // --- Handlers ---
  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const openProject = (project: Project) => {
    // Check if tab exists
    const existingTab = tabs.find(t => t.projectId === project.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // Create new tab
    const newTab: Tab = {
      id: Date.now().toString(),
      projectId: project.id,
      title: project.title,
      type: 'preview'
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    // If we closed the active tab, switch to the last available, or null
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeProject = tabs.find(t => t.id === activeTabId);
  const projectData = activeProject ? projects.find(p => p.id === activeProject.projectId) : null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">

      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-16'} flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="h-14 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 text-indigo-400 font-bold tracking-tight">
            <Layout className="flex-shrink-0" />
            {isSidebarOpen && <span className="text-white truncate">DevShowcase</span>}
          </div>
        </div>

        {/* User Info (Mini) */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <img src={AVATAR_URL} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700" />
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">Alex Developer</h4>
                <p className="text-xs text-slate-500 truncate">Senior React Engineer</p>
              </div>
            </div>
          </div>
        )}

        {/* Project List / Nav */}
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {isSidebarOpen && (
            <div className="px-2 py-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Filter projects..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Library ({filteredProjects.length})
              </div>
            </div>
          )}

          {filteredProjects.map(project => (
            <button
              key={project.id}
              onClick={() => openProject(project)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-left
                ${isSidebarOpen ? '' : 'justify-center'}
                ${tabs.some(t => t.projectId === project.id && t.id === activeTabId)
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }
              `}
              title={!isSidebarOpen ? project.title : undefined}
            >
              <FolderGit2 size={18} className="flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium truncate">{project.title}</span>}
            </button>
          ))}

          {filteredProjects.length === 0 && isSidebarOpen && (
            <div className="text-center py-8 text-slate-600 text-xs">
              No projects found.
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setAddModalOpen(true)}
            className={`w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/20 ${!isSidebarOpen && 'justify-center'}`}
          >
            <Plus size={18} />
            {isSidebarOpen && <span className="text-sm font-bold">Import Project</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">

        {/* Top Tab Bar */}
        <header className="h-10 bg-slate-900 border-b border-slate-800 flex items-end px-2 gap-1 overflow-x-auto no-scrollbar z-10">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="mb-1 mr-2 p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <Maximize2 size={14} className={isSidebarOpen ? 'rotate-180' : ''} />
          </button>

          {/* Home Tab */}
          <button
            onClick={() => setActiveTabId(null)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-medium border-t border-x border-transparent transition-all min-w-[100px]
              ${activeTabId === null
                ? 'bg-slate-950 text-indigo-400 border-slate-800 border-b-slate-950 translate-y-[1px]'
                : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }
            `}
          >
            <Grid size={14} />
            <span>Dashboard</span>
          </button>

          {/* Project Tabs */}
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`
                group flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-medium border-t border-x border-transparent transition-all min-w-[120px] max-w-[200px] cursor-pointer relative
                ${activeTabId === tab.id
                  ? 'bg-slate-950 text-indigo-400 border-slate-800 border-b-slate-950 translate-y-[1px]'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }
              `}
            >
              <span className="truncate pr-4">{tab.title}</span>
              <button
                onClick={(e) => closeTab(e, tab.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-hidden relative">

          {/* DASHBOARD VIEW (When no active tab) */}
          {activeTabId === null && (
            <div className="absolute inset-0 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Portfolio Dashboard</h1>
                    <p className="text-slate-400">Welcome to your project showcase. Select a project to preview.</p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <Github size={16} />
                      GitHub Profile
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {/* Create New Card (First Item) */}
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="group border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all min-h-[300px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-900 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                      <Plus size={32} />
                    </div>
                    <span className="font-semibold">Link External Repo</span>
                    <span className="text-xs text-slate-600 group-hover:text-indigo-400/70">Add a UI from another GitHub repo</span>
                  </button>

                  {/* Project Cards */}
                  {filteredProjects.map(project => (
                    <div key={project.id} className="h-[320px]">
                      <ProjectCard project={project} onOpen={openProject} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROJECT VIEWS */}
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`absolute inset-0 bg-slate-950 transition-opacity duration-200 ${activeTabId === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {/* Note: We keep all iframes mounted (but hidden) so they don't reload when switching tabs */}
              <ProjectView project={projects.find(p => p.id === tab.projectId)!} />
            </div>
          ))}

        </div>
      </main>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProject}
      />

    </div>
  );
}

export default App;