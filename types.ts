export interface Project {
  id: string;
  title: string;
  description: string;
  githubUrl?: string;
  demoUrl: string;
  tags: string[];
  thumbnail?: string;
  addedAt: number;
}

export interface Tab {
  id: string;
  projectId: string;
  title: string;
  type: 'preview' | 'code' | 'details';
}

export type ViewMode = 'grid' | 'list';
