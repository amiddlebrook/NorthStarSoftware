import { writeFile, readFile } from 'node:fs/promises';

const owner = 'amiddlebrook';
const dest = new URL('../public/repositories.json', import.meta.url);
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const headers = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'NorthStarSoftware-Portfolio-Indexer',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: 'Bearer ' + token } : {})
};
async function fetchPage(page) {
  const response = await fetch('https://api.github.com/users/' + owner + '/repos?per_page=100&type=owner&sort=updated&page=' + page, { headers });
  if (!response.ok) throw new Error('GitHub returned ' + response.status + ' on page ' + page + ': ' + (await response.text()).slice(0, 240));
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error('Invalid repository list returned by GitHub');
  return payload;
}
const all = [];
try {
  for (let page = 1; page <= 100; page++) {
    const entries = await fetchPage(page);
    all.push(...entries);
    if (entries.length < 100) break;
    if (page === 100) throw new Error('Repository pagination limit reached');
  }
  const repos = all
    .filter(r => r.owner?.login?.toLowerCase() === owner && r.private === false)
    .map(r => ({
      name: r.name, full_name: r.full_name, html_url: r.html_url,
      description: r.description, homepage: r.homepage, topics: r.topics || [],
      language: r.language, stargazers_count: r.stargazers_count || 0,
      forks_count: r.forks_count || 0, updated_at: r.updated_at,
      pushed_at: r.pushed_at, archived: !!r.archived, fork: !!r.fork
    }));
  if (!repos.length) throw new Error('Refusing to publish empty portfolio');
  repos.sort((a, b) => (Date.parse(b.pushed_at || b.updated_at) || 0) - (Date.parse(a.pushed_at || a.updated_at) || 0));
  await writeFile(dest, JSON.stringify({ generated_at: new Date().toISOString(), source: 'GitHub public user repositories API', repos }, null, 2) + '\n');
  console.log('Indexed ' + repos.length + ' public repositories from ' + owner);
} catch (error) {
  if (process.env.CI) throw error;
  const existing = JSON.parse(await readFile(dest, 'utf8'));
  if (!Array.isArray(existing.repos) || !existing.repos.length) throw error;
  console.warn('GitHub sync failed, retaining checked-in catalog:', error.message);
}
