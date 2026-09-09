// Run with Node and Playwright installed. Backend substitutes exist only in this test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mapSource = fs.readFileSync(path.join(root, 'map.html'), 'utf8');
const positions = vm.runInNewContext('(' + mapSource.match(/const PERMANENT_MAP_POSITIONS = (\{[\s\S]*?\n        \});/)[1] + ')');
assert.equal(Object.keys(positions).length, 50);
const committedMap = execFileSync('git',['show','HEAD:map.html'],{cwd:root,encoding:'utf8'});
const committedPositions = vm.runInNewContext('(' + committedMap.match(/const PERMANENT_MAP_POSITIONS = (\{[\s\S]*?\n        \});/)[1] + ')');
assert.equal(JSON.stringify(positions),JSON.stringify(committedPositions),'Confirmed map coordinates must remain unchanged');
const locations = Object.keys(positions).map(id => ({ id, name:id.replace(/-/g,' '), category:/cafe|annex|ssc/.test(id)?'food':'academic', xp:100, description:'Campus landmark integration test.' }));
const state = { user:{id:'test-only', name:'Explorer', xp:220, level:3, discoveries:['national-library'], completedQuests:[]}, locations, quests:[] };
const service = `let state=${JSON.stringify(state)};export const getState=()=>state;export const loadGameData=async()=>{};export const getTotalXP=()=>220;export const getLevel=()=>3;export const getTotalDiscoveries=()=>1;export const getTotalLocations=()=>50;export const getLocationStatus=id=>id==='national-library'?'discovered':'locked';export const getCompletionPercentage=()=>2;export const subscribe=fn=>()=>{};export const getLeaderboard=async()=>({success:true,data:{leaderboard:[{name:'Explorer',xp:220}]}});export const refreshUserData=async()=>{};export const unlockLocation=()=>{throw Error('Visual UI attempted unlock')};`;
const auth = `export const getCurrentUser=async()=>({success:true,data:${JSON.stringify(state.user)}});`;
const api = `const locations=${JSON.stringify(locations)};export const getLocations=async()=>({success:true,data:locations});export const getLocation=async id=>({success:true,data:locations.find(l=>l.id===id)});`;
const server = http.createServer((req,res) => {
    const pathname = new URL(req.url,'http://localhost').pathname;
    const stub = {'/js/auth.js':auth,'/js/dataService.js':service,'/js/api.js':api}[pathname];
    if (stub) {res.setHeader('Content-Type','text/javascript');res.end(stub);return;}
    const file = path.resolve(root,'.'+decodeURIComponent(pathname));
    if (!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
    const type={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.jpeg':'image/jpeg'}[path.extname(file)];
    res.setHeader('Content-Type',type||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const browser=await chromium.launch({headless:true,channel:'msedge'});
    try {
        const page=await browser.newPage({viewport:{width:1366,height:768}});
        const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE:',e.message);});
        page.on('console',message=>{if(message.type()==='error')console.error('BROWSER:',message.text());});
        page.on('requestfailed',request=>console.error('REQUEST:',request.url(),request.failure()?.errorText));
        await page.goto(`http://127.0.0.1:${server.address().port}/map.html`,{waitUntil:'networkidle'});
        await page.locator('.world-player').waitFor();
        await page.waitForTimeout(500);
        const checkCoverage=async label=>{
            const covered=await page.evaluate(()=>{
                const frame=document.getElementById('campusMap').getBoundingClientRect();
                const art=document.querySelector('#campusMap .leaflet-image-layer').getBoundingClientRect();
                return art.left<=frame.left+.5 && art.top<=frame.top+.5 &&
                    art.right>=frame.right-.5 && art.bottom>=frame.bottom-.5;
            });
            assert.ok(covered,`Campus must cover every edge: ${label}`);
        };
        await checkCoverage('default view');
        assert.equal(await page.getByRole('button',{name:'Zoom out',exact:true}).isDisabled(),true);
        for(let i=0;i<3;i++) {await page.evaluate(()=>window.zoomIn());await page.waitForTimeout(300);}
        for(let i=0;i<7;i++) {
            await page.evaluate(()=>window.zoomOut());
            await page.waitForTimeout(100);await checkCoverage('during zoom out');
            await page.waitForTimeout(200);await checkCoverage('zoom-out limit');
        }
        // Bounds must hold DURING dragging, not just snap back on mouse release.
        for(const [x,y] of [[40,465],[1320,465],[683,100],[683,710]]) {
            await page.evaluate(()=>window.centerMap());await page.waitForTimeout(350);
            await page.mouse.move(683,465);await page.mouse.down();
            await page.mouse.move(x,y,{steps:12});await checkCoverage('dragging toward an edge');
            await page.mouse.up();await page.waitForTimeout(250);await checkCoverage('after edge drag');
        }
        await page.mouse.move(683,465);await page.mouse.wheel(0,4000);await page.waitForTimeout(400);
        await checkCoverage('scroll-wheel zoom-out limit');
        await page.locator('#campusMap').focus();await page.keyboard.press('-');await page.waitForTimeout(350);
        await checkCoverage('keyboard zoom-out limit');
        await page.setViewportSize({width:1680,height:1050});await page.waitForTimeout(400);
        await checkCoverage('larger resized frame');
        await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(400);
        await page.getByRole('button',{name:'Reset campus view',exact:true}).click();await page.waitForTimeout(350);
        await checkCoverage('reset view');
        assert.equal(await page.locator('.campus-landmark').count(),50);
        assert.match(await page.locator('#mapPositionNote').innerText(),/50\/50/);
        assert.match(await page.locator('.hud-xp').innerText(),/220/);
        assert.equal(await page.locator('.world-quest-list a').count(),3);
        assert.equal(await page.locator('.explorer-character').count(),1);
        const explorerSize=await page.locator('.explorer-avatar').boundingBox();
        assert.equal(explorerSize.width,28);assert.equal(explorerSize.height,40);
        const scenery=page.locator('.campus-ambience');
        await page.locator('.campus-ambience[data-ready="true"][data-motion="running"]').waitFor();
        const readFrame=()=>scenery.evaluate(canvas=>canvas.toDataURL());
        const firstScene=await readFrame();
        const pinPosition=await page.locator('.custom-marker').first().boundingBox();
        await page.waitForTimeout(1000);
        assert.notEqual(await readFrame(),firstScene,'Campus environment should animate without user interaction');
        assert.deepEqual(await page.locator('.custom-marker').first().boundingBox(),pinPosition,'Ambient animation must not move location pins');
        await page.getByRole('button',{name:'Pause campus animation',exact:true}).click();
        const pausedScene=await readFrame();await page.waitForTimeout(350);
        assert.equal(await readFrame(),pausedScene,'Pause must stop the environment render loop');
        await page.getByRole('button',{name:'Play campus animation',exact:true}).click();
        await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
        await page.locator('.campus-ambience[data-motion="paused"]').waitFor();
        const offscreenScene=await readFrame();await page.waitForTimeout(350);
        assert.equal(await readFrame(),offscreenScene,'Offscreen scenery must not keep rendering');
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.locator('.campus-ambience[data-motion="running"]').waitFor();
        await page.screenshot({path:path.join(os.tmpdir(),'lost-campus-desktop.png')});
        // Keyboard activates the actual Leaflet marker and its game details sheet.
        const marker=page.locator('.custom-marker').first();
        await marker.focus();await page.keyboard.press('Enter');
        await page.locator('.world-destination:not([hidden])').waitFor();
        const destination = page.locator('.world-destination');
        await page.locator('.world-destination[data-typing="true"]').waitFor();
        const fullTitle = await destination.locator('h2 .retro-full').textContent();
        assert.equal(fullTitle,locations[0].name,'Assistive technology receives the entire title immediately');
        assert.ok((await destination.locator('h2 .retro-visual').textContent()).length < fullTitle.length,'The visible title starts partially typed');
        await destination.getByRole('button',{name:'Mute typing sound',exact:true}).click();
        assert.equal(await destination.getByRole('button',{name:'Enable typing sound',exact:true}).getAttribute('aria-pressed'),'false');
        await destination.getByRole('button',{name:'Show all text immediately'}).click();
        assert.equal(await destination.locator('h2').textContent(),fullTitle);
        assert.equal(await destination.getAttribute('data-typing'),null);
        // Rapid re-selection must never let a previous animation restore old text.
        await page.evaluate(async () => {
            const {revealDialogue, stopDialogue} = await import('./js/retro-dialogue.js');
            const panel = document.createElement('section'); panel.id = 'dialogue-regression';
            const text = document.createElement('p'); text.textContent = 'Original message';
            panel.append(text); document.body.append(panel);
            revealDialogue(panel, 'p');
            text.textContent = 'Latest message <safe text>';
            revealDialogue(panel, 'p');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (text.textContent !== 'Latest message <safe text>' || panel.dataset.typing) throw Error('Stale dialogue text or unfinished reveal');
            if (text.querySelector('safe')) throw Error('Dialogue interpreted text as markup');
            stopDialogue(panel); panel.remove();
        });
        assert.equal(await page.locator('.filter-btn .retro-visual, .map-titlebar .retro-visual, .hud-xp .retro-visual').count(),0);
        assert.equal(await destination.evaluate(el=>getComputedStyle(el).borderTopColor),'rgb(237, 198, 91)');
        await page.waitForTimeout(350);await checkCoverage('focus on an edge landmark');
        await page.getByRole('button',{name:'PREVIEW ROUTE'}).click();
        await page.waitForTimeout(1500);
        await checkCoverage('route preview');
        await page.screenshot({path:path.join(os.tmpdir(),'lost-campus-route.png')});
        await page.waitForTimeout(8000);
        assert.match(await page.locator('.route-status').innerText(),/Preview complete/);
        assert.match(await page.locator('.hud-discoveries').innerText(),/1\/50/);
        assert.match(await page.locator('.hud-xp').innerText(),/220/);
        await page.getByRole('button',{name:'DETAILS',exact:true}).click();
        await page.locator('#location-modal.active').waitFor();
        await page.locator('#location-modal .retro-skip').click();
        assert.equal(await page.locator('#locationDescription').textContent(),locations[0].description);
        await page.keyboard.press('Escape');
        await page.getByRole('button',{name:'Close location',exact:true}).click();
        await page.getByRole('button',{name:'Open your player profile'}).click();
        await page.locator('.world-dialog[open]').waitFor();
        assert.equal(await page.locator('.world-dialog .retro-mute').getAttribute('aria-pressed'),'false','Typing mute is shared across message boxes');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.world-dialog').getAttribute('data-typing'),null,'Closing cancels unfinished text');
        await page.getByRole('button',{name:/LEADERBOARD/}).click();
        await page.locator('.world-rank-list').waitFor();await page.keyboard.press('Escape');
        await page.getByRole('button',{name:'◇ NEARBY LANDMARKS',exact:true}).click();
        assert.equal(await page.locator('.world-nearby-list button').count(),5);
        await page.keyboard.press('Escape');
        await page.getByRole('button',{name:/SOUND OFF/}).click();
        assert.equal(await page.getByRole('button',{name:/SOUND ON/}).getAttribute('aria-pressed'),'true');
        await page.getByRole('button',{name:/SOUND ON/}).click();
        await page.getByRole('button',{name:'Food',exact:true}).click();
        assert.equal(await page.locator('.campus-hud').count(),1);
        assert.equal(await page.locator('.explorer-avatar').count(),1);
        assert.equal(await page.locator('.campus-ambience').count(),1,'Category changes must clean up old animation canvases');
        await page.getByRole('button',{name:'All',exact:true}).click();
        await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'networkidle'});
        await page.waitForTimeout(350);await checkCoverage('mobile default');
        await page.evaluate(()=>window.zoomOut());await page.waitForTimeout(350);await checkCoverage('mobile zoom-out limit');
        assert.equal(await page.locator('.world-quests').isVisible(),false);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
        await page.screenshot({path:path.join(os.tmpdir(),'lost-campus-mobile.png')});
        await page.getByRole('button',{name:'⚑ QUESTS',exact:true}).click();
        assert.equal(await page.locator('.world-quests').isVisible(),true);
        await page.getByRole('button',{name:'⚑ QUESTS',exact:true}).click();
        await page.route('**/qr.html?location=*', route => route.fulfill({contentType:'text/html',body:'<title>QR handoff target</title>'}));
        await page.locator('.custom-marker').first().focus();await page.keyboard.press('Enter');
        await page.locator('.world-destination:not([hidden])').waitFor();
        await page.locator('.world-destination .retro-skip').click();
        await page.screenshot({path:path.join(os.tmpdir(),'lost-campus-mobile-location.png')});
        const scanButton = page.getByRole('button',{name:'SCAN QR',exact:false});
        assert.ok(await scanButton.evaluate(button => {
            const rect = button.getBoundingClientRect();
            return button.contains(document.elementFromPoint(rect.right-10,rect.top+rect.height/2));
        }), 'Map controls must not cover the mobile QR action');
        await page.getByRole('button',{name:'SCAN QR',exact:false}).click();
        await page.waitForURL(/qr\.html\?location=/);
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.goto(`http://127.0.0.1:${server.address().port}/map.html?location=computer-engineering-department`,{waitUntil:'networkidle'});
        await page.locator('.world-destination:not([hidden])').waitFor();
        assert.match(await page.locator('.world-destination h2').innerText(),/computer engineering/);
        assert.equal(await page.locator('.retro-visual').count(),0,'Reduced motion gets immediate text without typing');
        assert.equal(await page.locator('.campus-ambience').getAttribute('data-motion'),'paused');
        assert.equal(await page.getByRole('button',{name:'Play campus animation',exact:true}).getAttribute('aria-pressed'),'false');
        await page.getByRole('button',{name:'PREVIEW ROUTE',exact:false}).click();
        assert.match(await page.locator('.route-status').innerText(),/Static route preview/);
        assert.equal(errors.length,0,errors.join('\n'));
        console.log('PASS: reference palette, typewriter, accessible full text, skip, shared typing mute, close cleanup, 50 unchanged positions, living canvas, motion pause/resume, offscreen suspension, reduced motion, stable pins, selection, route preview without rewards, details, profile, leaderboard, music, lifecycle, mobile layout, and QR handoff.');
        console.log('Screenshots: '+path.join(os.tmpdir(),'lost-campus-desktop.png')+' and '+path.join(os.tmpdir(),'lost-campus-mobile.png'));
    } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
