import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Link as LinkIcon, Github, BookOpen, Copy } from 'lucide-react';
import { Project } from '../types';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (project: Project) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [showGuide, setShowGuide] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        githubUrl: '',
        demoUrl: '',
        tags: '',
    });

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setShowGuide(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => {
            const newState = { ...prev, githubUrl: url };

            // Smart URL detection:
            // If the user enters a github repo url and Demo URL is empty, try to guess the Pages URL
            // Pattern: https://github.com/username/repo -> https://username.github.io/repo
            if (!prev.demoUrl && url.includes('github.com')) {
                try {
                    const cleanUrl = url.replace('www.', '').replace('https://', '').replace('http://', '');
                    const parts = cleanUrl.split('/');
                    if (parts[0] === 'github.com' && parts.length >= 3) {
                        const user = parts[1];
                        const repo = parts[2];
                        newState.demoUrl = `https://${user}.github.io/${repo}/`;

                        // Auto-fill title if empty
                        if (!prev.title) {
                            newState.title = repo.charAt(0).toUpperCase() + repo.slice(1).replace(/-/g, ' ');
                        }
                    }
                } catch (err) {
                    // Ignore parsing errors
                }
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newProject: Project = {
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            githubUrl: formData.githubUrl,
            demoUrl: formData.demoUrl,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            addedAt: Date.now(),
            thumbnail: `https://picsum.photos/seed/${formData.title.length + 5}/800/600` // Random based on name length
        };
        onAdd(newProject);
        setFormData({ title: '', description: '', githubUrl: '', demoUrl: '', tags: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Plus className="text-indigo-500" />
                            Import Project
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Link your external repositories to showcase them.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Guide Section */}
                    <div className="px-6 pt-6">
                        <button
                            onClick={() => setShowGuide(!showGuide)}
                            className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-4 text-left transition-colors flex items-start gap-3 group"
                        >
                            <BookOpen className="text-indigo-400 mt-1 flex-shrink-0" size={20} />
                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-indigo-200 font-semibold text-sm">How to host your separate Repos?</h3>
                                    <span className="text-xs text-indigo-400 group-hover:underline">
                                        {showGuide ? 'Hide Guide' : 'Show Guide'}
                                    </span>
                                </div>
                                <p className="text-indigo-300/70 text-xs mt-1">
                                    Use "Deploy from Branch" and disable Jekyll to support React apps.
                                </p>
                            </div>
                        </button>

                        {showGuide && (
                            <div className="mt-4 bg-slate-950 rounded-lg p-5 border border-slate-800 text-sm text-slate-300 space-y-4 animate-in slide-in-from-top-2">
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                    <div>
                                        <p className="font-semibold text-white">Select "Deploy from Branch"</p>
                                        <p className="text-xs text-slate-500">
                                            In Repo Settings {'>'} Pages {'>'} Build & deployment. Select <b>Deploy from a branch</b> (usually <code>main</code> or <code>gh-pages</code>).
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                    <div>
                                        <p className="font-semibold text-white">Use a .nojekyll file</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Important: Add an empty file named <code className="text-indigo-400">.nojekyll</code> to your public folder. This stops GitHub from breaking your JS/CSS asset paths.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                    <div>
                                        <p className="font-semibold text-white">Copy the Live URL</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Wait a moment for the build. GitHub will give you a URL like <br />
                                            <span className="font-mono text-green-400 bg-green-400/10 px-1 rounded">https://yourname.github.io/awesome-ui/</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                                    <div>
                                        <p className="font-semibold text-white">Paste it below</p>
                                        <p className="text-xs text-slate-500">Paste the Repo URL first, and we'll try to guess the Live URL for you.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Github size={14} /> Repository URL
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                    placeholder="https://github.com/username/project"
                                    value={formData.githubUrl}
                                    onChange={handleGithubUrlChange}
                                />
                                <p className="text-[10px] text-slate-500 mt-1.5">
                                    Paste your repo link to auto-fill details.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <LinkIcon size={14} /> Live Demo URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                    placeholder="https://username.github.io/project"
                                    value={formData.demoUrl}
                                    onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Project Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                placeholder="e.g. Finance Dashboard"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                            <textarea
                                required
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors h-20 resize-none text-sm"
                                placeholder="Briefly describe the key features..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                placeholder="React, TypeScript, Tailwind..."
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 flex justify-between gap-3 flex-shrink-0 bg-slate-900/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={() => {
                            const tempProject = {
                                id: crypto.randomUUID(),
                                title: formData.title,
                                description: formData.description,
                                githubUrl: formData.githubUrl,
                                demoUrl: formData.demoUrl,
                                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                                addedAt: Date.now(),
                                thumbnail: `https://picsum.photos/seed/${formData.title.length + 5}/800/600`
                            };
                            navigator.clipboard.writeText(JSON.stringify(tempProject, null, 2));
                            alert("JSON copied! Paste this into public/projects.json to save permanently.");
                        }}
                        className="px-4 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors text-xs font-medium flex items-center gap-2"
                    >
                        <Copy size={16} />
                        Copy JSON
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                        >
                            <Upload size={16} />
                            Add to Portfolio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};