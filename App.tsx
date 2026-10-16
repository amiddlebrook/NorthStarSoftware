import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, Code2, ExternalLink,
  FolderGit2, GitFork, Github, Globe2, Layers3, LayoutGrid, List,
  Menu, Search, Sparkles, Star, X
} from 'lucide-react';
import './styles.css';

type Repo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
  pushed_at: string | null;
  archived: boolean;
  fork: boolean;
};
type Catalog = { generated_at: string; source?: string; repos: Repo[] };
type Category = 'All work' | 'AI & automation' | 'Applications' | 'Interfaces' | 'Infrastructure';

const featuredNames = ['RivetFlow', 'SignalBench', 'ProofAtlas', 'KestrelMesh', 'GradientFoundry'];
const aiNames = new Set([...featuredNames, 'Agent-Trainer', 'AAB', 'Mordor-Analytics']);
const interfaceNames = new Set([
  'Morphogenic-UI', 'Orbital-Glass', 'UI_template_2', 'UI_template_3',
  'solar-system-ui-template', 'SysZeroCool', 'System-Zero-Tactical',
  'eclipse-command', 'eclipse-os', 'SystemZero', 'Bio-System'
]);
const infrastructureNames = new Set(['Tesseract', 'Origin', 'vela-app-studio']);
const categories: Category[] = ['All work', 'AI & automation', 'Applications', 'Interfaces', 'Infrastructure'];

function categoryFor(repo: Repo): Category {
  if (aiNames.has(repo.name) || repo.topics?.some(t => /agent|machine-learning|artificial-intelligence|llm/i.test(t))) return 'AI & automation';
  if (interfaceNames.has(repo.name) || /(?:^ui[_-]|ui-template|design-system)/i.test(repo.name)) return 'Interfaces';
  if (infrastructureNames.has(repo.name) || repo.topics?.some(t => /devops|infrastructure|platform-engineering/i.test(t))) return 'Infrastructure';
  return 'Applications';
}
function cleanUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith('http') ? value : 'https://' + value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function age(value: string | null): string {
  if (!value) return 'GitHub repository';
  const day = new Date(value);
  if (!Number.isFinite(day.getTime())) return 'GitHub repository';
  return 'Updated ' + day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getMonogram(name: string) {
  const parts = name.replace(/[_-]/g, ' ').split(' ').filter(Boolean);
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}
function getColor(name: string): number {
  return [...name].reduce((x, c) => x + c.charCodeAt(0), 0) % 6;
}
function ProjectCard({ repo, compact = false }: { repo: Repo; compact?: boolean }) {
  const demo = cleanUrl(repo.homepage);
  const category = categoryFor(repo);
  return (
    <article className={'project-card shade-' + getColor(repo.name) + (compact ? ' compact-card' : '')}>
      <div className="card-top">
        <span className="project-mark" aria-hidden="true">{getMonogram(repo.name)}</span>
        <a className="icon-button" href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label={'Open ' + repo.name + ' on GitHub'}>
          <ArrowUpRight size={19} />
        </a>
      </div>
      <div className="card-body">
        <span className="eyebrow">{category}{repo.archived ? ' · Archived' : ''}</span>
        <h3><a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.name.replace(/_/g, ' ')}</a></h3>
        <p>{repo.description?.trim() || 'Explore the source code, documentation, and development history on GitHub.'}</p>
      </div>
      <div className="card-bottom">
        <span className="card-meta">
          <span className="language-dot" />
          {repo.language || 'Repository'}
        </span>
        <span className="card-stats" aria-label={repo.stargazers_count + ' stars and ' + repo.forks_count + ' forks'}>
          <Star size={13} /> {repo.stargazers_count || 0}
          <GitFork size={13} /> {repo.forks_count || 0}
        </span>
      </div>
      <div className="card-links">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer"><Github size={15} /> Source code <ArrowUpRight size={14}/></a>
        {demo && <a href={demo} target="_blank" rel="noopener noreferrer"><Globe2 size={15}/> Website <ArrowUpRight size={14}/></a>}
      </div>
    </article>
  );
}

function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [category, setCategory] = useState<Category>('All work');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [display, setDisplay] = useState<'grid' | 'list'>('grid');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let alive = true;
    fetch('/repositories.json', { cache: 'no-cache' })
      .then(async response => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json() as Promise<Catalog>;
      })
      .then(data => {
        if (alive && Array.isArray(data.repos)) setCatalog(data);
        else if (alive) setLoadError(true);
      })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); searchRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery(''); searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const repos = catalog?.repos || [];
  const featured = useMemo(() => featuredNames.map(n => repos.find(r => r.name === n)).filter((r): r is Repo => Boolean(r)), [repos]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = repos.filter(r =>
      (category === 'All work' || categoryFor(r) === category) &&
      (!term || [r.name, r.description || '', r.language || '', ...r.topics, categoryFor(r)].join(' ').toLowerCase().includes(term))
    );
    return items.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0) || a.name.localeCompare(b.name);
      return (Date.parse(b.pushed_at || b.updated_at || '') || 0) - (Date.parse(a.pushed_at || a.updated_at || '') || 0) || a.name.localeCompare(b.name);
    });
  }, [repos, query, category, sort]);
  const languages = new Set(repos.map(r => r.language).filter(Boolean)).size;
  const categoryCount = (cat: Category) => cat === 'All work' ? repos.length : repos.filter(r => categoryFor(r) === cat).length;
  const syncDate = catalog?.generated_at && Number.isFinite(Date.parse(catalog.generated_at))
    ? new Date(catalog.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const selectCategory = (cat: Category) => {
    setCategory(cat); setMenuOpen(false);
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="site">
      <div className="mobile-bar">
        <a className="mobile-brand" href="#home"><span className="brand-symbol">N<span>✦</span></span> NORTHSTAR</a>
        <button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
      <aside className={'sidebar ' + (menuOpen ? 'sidebar-open' : '')}>
        <a href="#home" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-symbol">N<span>✦</span></span>
          <span className="brand-text">NORTHSTAR <small>SOFTWARE / STUDIO</small></span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Project navigation" className="nav">
          {categories.map((cat, i) => <button key={cat} className={'nav-item ' + (category === cat ? 'nav-active' : '')} onClick={() => selectCategory(cat)}>
            {i === 0 ? <LayoutGrid size={17}/> : i === 1 ? <Sparkles size={17}/> : i === 2 ? <FolderGit2 size={17}/> : i === 3 ? <Layers3 size={17}/> : <Code2 size={17}/>}
            <span>{cat}</span><span className="nav-count">{categoryCount(cat)}</span>
          </button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="profile-panel">
          <img src="https://avatars.githubusercontent.com/u/26336026?v=4" alt="" loading="lazy" width="42" height="42"/>
          <div><strong>@amiddlebrook</strong><span>GitHub portfolio</span></div>
          <a href="https://github.com/amiddlebrook" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><ArrowUpRight size={17}/></a>
        </div>
        <p className="sidebar-caption">Built for the open web.<br/>Powered by Cloudflare + GitHub.</p>
      </aside>
      {menuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <main id="home" className="main">
        <header className="topbar">
          <div className="breadcrumb"><span>PORTFOLIO</span><span className="slash">/</span><strong>Overview</strong></div>
          <div className="top-actions">
            <span className="availability"><span /> PUBLIC PROJECT DIRECTORY</span>
            <a className="top-github" href="https://github.com/amiddlebrook" target="_blank" rel="noopener noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={14}/></a>
          </div>
        </header>
        <div className="content">
          <section className="hero">
            <div className="hero-glow" aria-hidden="true"/>
            <div className="hero-content">
              <div className="microheading"><span className="pulse-dot"/> THE WORK / THE BUILDS / THE IDEAS</div>
              <h1>Software built<br/><em>to do more.</em></h1>
              <p>A complete index of the public projects behind NorthStar Software — applications, AI systems, developer tools, and interface experiments. All in one place.</p>
              <div className="hero-actions">
                <a href="#directory" className="button-primary">Explore the projects <ArrowRight size={17}/></a>
                <a href="https://github.com/amiddlebrook" target="_blank" rel="noopener noreferrer" className="button-ghost"><Github size={17}/> View GitHub profile</a>
              </div>
            </div>
            <div className="hero-graphic" aria-hidden="true">
              <div className="orbit orbit-1" /><div className="orbit orbit-2" /><div className="orbit orbit-3" />
              <div className="hero-core"><span>N</span><i>✦</i></div>
              <div className="orbit-point point-1"/><div className="orbit-point point-2"/><div className="orbit-point point-3"/>
              <div className="graphic-tag tag-top">BUILD / SHIP / REPEAT</div>
              <div className="graphic-tag tag-bottom">NORTHSTAR — 001</div>
            </div>
          </section>
          <section className="metrics" aria-label="Portfolio statistics">
            <div className="metric"><span>PUBLIC REPOSITORIES</span><strong>{catalog ? repos.length : '—'}</strong><small>Automatically indexed</small></div>
            <div className="metric"><span>FEATURED PROJECTS</span><strong>{catalog ? featured.length : '—'}</strong><small>Selected engineering work</small></div>
            <div className="metric"><span>LANGUAGES</span><strong>{catalog ? (languages || '—') : '—'}</strong><small>As listed on GitHub</small></div>
            <div className="metric"><span>LAST CATALOG SYNC</span><strong className="metric-date">{syncDate}</strong><small>Scheduled refresh every 6 hours</small></div>
          </section>
          {featured.length > 0 && (
            <section className="featured-section" aria-labelledby="featured-title">
              <div className="section-heading"><div><div className="section-kicker"><span>01</span> / HANDPICKED</div><h2 id="featured-title">Featured work<span className="h2-dot">.</span></h2></div><p>Selected projects from the portfolio.</p></div>
              <div className="featured-grid">
                {featured.map((repo, i) => <article className={'featured-card featured-' + i} key={repo.name}>
                  <div className="featured-card-top"><span>PROJECT / {String(i + 1).padStart(2, '0')}</span><a aria-label={'View ' + repo.name + ' repository'} href={repo.html_url} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={20}/></a></div>
                  <div className="featured-icon"><span>{getMonogram(repo.name)}</span></div>
                  <div><span className="eyebrow">AI & AUTOMATION</span><h3>{repo.name}</h3><p>{repo.description || 'Explore this project’s architecture, source code, and documentation.'}</p></div>
                  <a className="featured-link" href={repo.html_url} target="_blank" rel="noopener noreferrer">Explore repository <ArrowRight size={16}/></a>
                </article>)}
              </div>
            </section>
          )}
          <section className="directory-section" id="directory" aria-labelledby="directory-title">
            <div className="section-heading"><div><div className="section-kicker"><span>02</span> / COMPLETE ARCHIVE</div><h2 id="directory-title">Project directory<span className="h2-dot">.</span></h2></div><p>Every public repository. Nothing hidden behind a curated list.</p></div>
            <div className="toolbar">
              <label className="search-wrap"><Search size={19}/><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects, technologies, descriptions..." aria-label="Search repositories"/>{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={16}/></button>}<kbd>⌘ K</kbd></label>
              <div className="toolbar-right">
                <label className="sort-wrap" aria-label="Sort repositories"><span>SORT</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Recently updated</option><option value="name">Name A–Z</option><option value="stars">Most starred</option></select><ChevronDown size={15}/></label>
                <div className="display-toggle" role="group" aria-label="Display mode"><button aria-label="Grid view" aria-pressed={display === 'grid'} className={display === 'grid' ? 'selected' : ''} onClick={() => setDisplay('grid')}><LayoutGrid size={16}/></button><button aria-label="List view" aria-pressed={display === 'list'} className={display === 'list' ? 'selected' : ''} onClick={() => setDisplay('list')}><List size={16}/></button></div>
              </div>
            </div>
            <div className="filter-row">
              {categories.map(cat => <button key={cat} className={'filter-pill ' + (category === cat ? 'pill-active' : '')} onClick={() => setCategory(cat)}>{cat}<span>{categoryCount(cat)}</span></button>)}
            </div>
            <div className="result-count"><span>{filtered.length} {filtered.length === 1 ? 'REPOSITORY' : 'REPOSITORIES'}</span><span>Source: <a href="https://github.com/amiddlebrook?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub / @amiddlebrook <ExternalLink size={12}/></a></span></div>
            {loadError ? <div className="empty-state"><Code2 size={28}/><h3>Unable to load repository index</h3><p>Please reload the page or browse the public repositories directly on GitHub.</p><a href="https://github.com/amiddlebrook?tab=repositories">Open GitHub <ArrowUpRight size={15}/></a></div> :
              !catalog ? <div className="loading-state">Loading public repositories…</div> :
              filtered.length === 0 ? <div className="empty-state"><Search size={28}/><h3>No matching projects</h3><p>Try a different search or reset the filters.</p><button onClick={() => {setQuery('');setCategory('All work');}}>Clear filters <ArrowRight size={15}/></button></div> :
              <div className={'projects-grid ' + (display === 'list' ? 'projects-list' : '')}>{filtered.map(repo => <ProjectCard key={repo.full_name} repo={repo} compact={display === 'list'}/>)}</div>
            }
          </section>
          <section className="bottom-banner"><div><span className="microheading">FOLLOW THE WORK</span><h2>See what ships next.</h2><p>The directory refreshes from GitHub automatically as public repositories are added or updated.</p></div><a href="https://github.com/amiddlebrook?tab=repositories" target="_blank" rel="noopener noreferrer">All repositories on GitHub <ArrowUpRight size={18}/></a></section>
          <footer className="footer"><span>© {new Date().getFullYear()} NorthStar Software</span><span>PUBLIC PORTFOLIO <span className="footer-star">✦</span> CLOUDFLARE WORKERS</span><a href="https://github.com/amiddlebrook/NorthStarSoftware" target="_blank" rel="noopener noreferrer">Portfolio source <ArrowUpRight size={13}/></a></footer>
        </div>
      </main>
    </div>
  );
}
export default App;
