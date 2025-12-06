import { Project } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'APEX Analytics Dashboard',
    description: 'A high-performance UFC betting analytics engine featuring real-time odds, human-factor lattice modeling, and rigorous exposure controls.',
    githubUrl: 'https://github.com/google/generative-ai-js',
    demoUrl: 'https://google.github.io/mesop/', // Using a reliable placeholder that allows framing
    tags: ['React', 'D3.js', 'Tailwind', 'Finance'],
    addedAt: Date.now(),
    thumbnail: 'https://picsum.photos/seed/apex/800/600'
  },
  {
    id: '2',
    title: 'Neon Commerce',
    description: 'A futuristic e-commerce storefront with 3D product previews and AI-driven recommendations.',
    githubUrl: 'https://github.com/facebook/react',
    demoUrl: 'https://react.dev', 
    tags: ['Next.js', 'Three.js', 'Stripe'],
    addedAt: Date.now() - 100000,
    thumbnail: 'https://picsum.photos/seed/neon/800/600'
  },
  {
    id: '3',
    title: 'TaskFlow Pro',
    description: 'Collaborative project management tool with real-time sockets and drag-and-drop kanban boards.',
    githubUrl: 'https://github.com/microsoft/typescript',
    demoUrl: 'https://www.typescriptlang.org/',
    tags: ['Vue', 'Firebase', 'Socket.io'],
    addedAt: Date.now() - 200000,
    thumbnail: 'https://picsum.photos/seed/task/800/600'
  }
];

export const AVATAR_URL = "https://picsum.photos/id/64/200/200";
