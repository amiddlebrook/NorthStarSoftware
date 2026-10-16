import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const file=new URL('../public/repositories.json',import.meta.url);
const catalog=JSON.parse(await readFile(file,'utf8'));
const jobs=catalog.repos.filter(r=>r.live_url);
await mkdir(new URL('../public/previews/',import.meta.url),{recursive:true});
if(jobs.length){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let idx=0;
  async function screenshotWorker(){
    while(idx<jobs.length){
      const repo=jobs[idx++];
      const filename=repo.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.jpg';
      const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:false});
      try{
        const response=await page.goto(repo.live_url,{waitUntil:'domcontentloaded',timeout:17500});
        if(!response || !response.ok())throw new Error('Page did not load successfully');
        await page.waitForTimeout(1500);
        await page.screenshot({path:new URL('../public/previews/'+filename,import.meta.url).pathname,type:'jpeg',quality:72,animations:'disabled',timeout:12000});
        repo.preview_image='/previews/'+filename;
        repo.preview_kind='Live screenshot';
        console.log('Captured actual app preview:',repo.name,repo.live_url);
      }catch(e){console.warn('Screenshot skipped:',repo.name,String(e).slice(0,150));}
      finally{await page.close();}
    }
  }
  await Promise.all(Array.from({length:3},screenshotWorker));
  await browser.close();
}
await writeFile(file,JSON.stringify(catalog,null,2)+'\n');
console.log('Live screenshots:',catalog.repos.filter(r=>r.preview_kind==='Live screenshot').length);
