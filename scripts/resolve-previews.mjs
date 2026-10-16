import { readFile, writeFile } from 'node:fs/promises';
const file = new URL('../public/repositories.json', import.meta.url);
const catalog = JSON.parse(await readFile(file, 'utf8'));
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const suffix = 'averymiddlebrook2014.workers.dev';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'NorthStarSoftware-Live-Preview-Resolver',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: 'Bearer ' + token } : {})
};
async function gh(path) {
  const response = await fetch('https://api.github.com' + path, {headers, signal:AbortSignal.timeout(13000)});
  if (!response.ok) return null;
  return response.json();
}
const validWorkerName = name => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(name);
function getWorkerName(content, ext) {
  const match = ext.endsWith('.toml')
    ? content.match(/^\s*name\s*=\s*["']([a-z0-9-]+)["']/m)
    : content.match(/"name"\s*:\s*"([a-z0-9-]+)"/);
  return match?.[1] && validWorkerName(match[1]) ? match[1] : null;
}
function getMedia(tree, branch, repo) {
  const choices = tree.filter(x => x.type === 'blob' && /\.(?:png|jpe?g|webp|gif)$/i.test(x.path) &&
    /(^|\/)(?:screenshots?|previews?|demo|media|assets)(\/|[-_.])|screenshot|brag-preview/i.test(x.path) &&
    !/node_modules|dist\/|\.wrangler/i.test(x.path));
  choices.sort((a,b) => {
    const score = p => (/screenshot|preview/i.test(p) ? -10 : 0) + (/docs\/media\/brag-preview/i.test(p) ? -20 : 0) + (/logo|favicon|icon/i.test(p) ? 20 : 0);
    return score(a.path) - score(b.path);
  });
  const picked=choices.find(x=>(x.size||0)<3_000_000);
  return picked ? 'https://raw.githubusercontent.com/amiddlebrook/'+encodeURIComponent(repo)+'/'+encodeURIComponent(branch)+'/'+picked.path.split('/').map(encodeURIComponent).join('/') : null;
}
async function liveCheck(url) {
  try {
    const response = await fetch(url, {headers:{Accept:'text/html'}, signal:AbortSignal.timeout(9000),redirect:'follow'});
    const body = await response.text();
    const html = /text\/html/i.test(response.headers.get('content-type')||'') || /<!doctype html|<html[\s>]/i.test(body.slice(0,300));
    if (!response.ok || !html || /cloudflare error|error 1001|error 1003|error 1101/i.test(body.slice(0,1600))) return false;
    const target = new URL(response.url);
    return target.protocol === 'https:' && !/(?:localhost|127\.0\.0\.1|\.internal)$/.test(target.hostname);
  } catch { return false; }
}
function homepageUrl(raw) {
  try {
    const url=new URL(raw);
    if(url.protocol!=='https:')return null;
    if(url.username||url.password||/(?:localhost|127\.0\.0\.1|\.internal)$/.test(url.hostname))return null;
    return url.href;
  }catch{return null;}
}
async function enrich(repo) {
  const safeRepo=encodeURIComponent(repo.name);
  const branch=repo.default_branch || 'main';
  const base='/repos/amiddlebrook/'+safeRepo;
  try {
    const listing=await gh(base+'/git/trees/'+encodeURIComponent(branch)+'?recursive=1');
    const tree=listing?.tree || [];
    const config=tree.find(x=>x.type==='blob' && ['wrangler.toml','wrangler.jsonc','wrangler.json'].includes(x.path)) ||
      tree.find(x=>x.type==='blob' && /^((?:web|app|frontend|worker|cloudflare)\/)?wrangler\.(?:toml|jsonc|json)$/.test(x.path) && !/\.pages\./.test(x.path));
    let worker=null;
    if(config){
      const info=await gh(base+'/contents/'+config.path.split('/').map(encodeURIComponent).join('/')+'?ref='+encodeURIComponent(branch));
      if(info?.content && info.encoding==='base64')
        worker=getWorkerName(Buffer.from(info.content,'base64').toString('utf8'),config.path);
    }
    const appUrl=worker ? 'https://'+worker+'.'+suffix+'/' : null;
    if(appUrl && await liveCheck(appUrl)){
      repo.live_url=appUrl;
      repo.live_kind='Cloudflare Workers';
    }else{
      const homepage=homepageUrl(repo.homepage);
      if(homepage && await liveCheck(homepage)){
        repo.live_url=homepage;
        repo.live_kind='Repository homepage';
      }
    }
    repo.preview_image=getMedia(tree,branch,repo.name);
    if(repo.preview_image)repo.preview_kind='Repository media';
    return {name:repo.name,worker,live:repo.live_url||null,media:!!repo.preview_image};
  }catch(e){
    return {name:repo.name,error:String(e).slice(0,100)};
  }
}
const repos=catalog.repos;
let next=0;
async function worker() {
  while(next<repos.length) {
    const repo=repos[next++];
    const result=await enrich(repo);
    console.log(JSON.stringify(result));
  }
}
await Promise.all(Array.from({length:5},worker));
await writeFile(file,JSON.stringify(catalog,null,2)+'\n');
console.log('Validated live website URLs:',repos.filter(r=>r.live_url).length,'of',repos.length);
