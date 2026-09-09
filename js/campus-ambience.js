// Living-wallpaper effects for the existing 1536 × 1024 campus illustration.
// All points below are decorative image-space [x, y-from-top] positions, NOT
// location records, GPS, walking directions, or real campus traffic data.
const WIDTH = 1536, HEIGHT = 1024;
let motionPreference, savedTime = 0;

// Traced along the roads/sidewalks visible in the existing campus artwork.
const ROADS = [
    [[750,-40],[750,455],[742,488],[717,516],[680,546],[665,582],[676,619],[704,656],[719,702],[719,775],[706,841],[680,898],[648,1060]],
    [[825,1060],[820,953],[802,914],[772,866],[752,826],[750,770],[755,704],[773,669],[801,635],[818,604],[817,571],[801,537],[779,504],[768,473],[768,-40]],
    [[-40,550],[232,550],[451,542],[544,539],[598,543],[629,558],[647,605],[674,640],[710,655],[754,657],[798,640],[835,617],[881,603],[1094,602],[1285,602],[1318,625],[1370,790],[1470,1060]]
];
const WALKS = [
    [[706,-20],[706,448],[695,478],[664,502],[610,519],[487,521],[232,531]],
    [[790,-20],[790,454],[805,487],[834,524],[846,557],[880,575],[1115,574],[1284,579]],
    [[681,1024],[687,934],[678,885],[687,829],[691,764],[691,704],[676,665],[637,631],[595,602]],
    [[862,995],[852,930],[853,853],[853,763],[861,668],[888,637],[1124,639]],
    [[184,574],[168,634],[149,694],[117,736],[87,761],[64,824],[15,897]]
];
const CANOPIES = [
    [704,194,17,17],[704,264,18,18],[701,328,18,19],[698,397,19,18],
    [803,455,21,18],[823,431,21,18],[619,650,23,21],[640,693,22,21],
    [583,759,20,20],[595,813,23,20],[485,854,23,21],[249,544,21,19],
    [202,728,19,22],[1362,588,23,23],[1378,656,23,20],[1387,829,22,23],
    [1417,909,22,22],[1124,967,22,23],[890,830,19,21],[1060,405,20,20]
];
const LAMPS = [[710,201],[711,314],[710,428],[800,424],[806,474],
    [584,525],[443,541],[304,551],[681,736],[692,809],[790,733],
    [817,857],[861,637],[958,629],[1060,630],[1202,631],[1310,690],
    [127,774],[163,634],[244,859],[591,874]];
const WATER = [[237,117,25,9],[341,172,16,11],[279,241,9,21],
    [185,218,18,9],[735,979,19,9]];

function trace(points) {
    let total = 0;
    const lengths = points.slice(1).map((point, i) => {
        total += Math.hypot(point[0]-points[i][0],point[1]-points[i][1]);
        return total;
    });
    return distance => {
        const d = ((distance % total) + total) % total;
        const index = lengths.findIndex(length => length > d);
        const from = points[index], to = points[index+1];
        const previous = index ? lengths[index-1] : 0;
        const progress = (d-previous)/(lengths[index]-previous);
        return {x:from[0]+(to[0]-from[0])*progress, y:from[1]+(to[1]-from[1])*progress,
            angle:Math.atan2(to[1]-from[1],to[0]-from[0])};
    };
}

function softDisc(color) {
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 128;
    const ctx = sprite.getContext('2d');
    const gradient = ctx.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,color); gradient.addColorStop(1,'transparent');
    ctx.fillStyle=gradient; ctx.fillRect(0,0,128,128);
    return sprite;
}

export function createCampusAmbience(map, container, onMotionChange = () => {}) {
    const canvas = document.createElement('canvas');
    canvas.className = 'campus-ambience'; canvas.setAttribute('aria-hidden','true');
    canvas.dataset.ready = 'false'; container.append(canvas);
    const ctx = canvas.getContext('2d', {alpha:true});
    if (!ctx) { canvas.remove(); onMotionChange(false); return {toggle:()=>false,setDay:()=>{},destroy:()=>{}}; }
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = motionPreference ?? !media.matches;
    let visible = true, destroyed = false, day = container.classList.contains('campus-day');
    let frame = 0, lastFrame = 0, time = savedTime, active = false, zooming = false;
    let ratio = 1, viewWidth = 1, viewHeight = 1;
    let projection = {x:0,y:0,scale:1};
    const cloud = softDisc('rgba(6,21,35,.25)');
    const haze = softDisc('rgba(198,224,223,.11)');
    const lamplight = softDisc('rgba(255,189,81,.48)');
    const firelight = softDisc('rgba(225,255,143,.75)');
    const roadPaths = ROADS.map(trace), walkPaths = WALKS.map(trace);
    const cars = Array.from({length:8},(_,i)=>({path:roadPaths[i%3],offset:i*183,
        speed:18+(i%3)*3,color:['#d6dccf','#dfab63','#6f98b1','#b76451'][i%4]}));
    const students = Array.from({length:18},(_,i)=>({path:walkPaths[i%5],offset:i*117,
        speed:(i%2 ? -1 : 1)*(5+i%3),color:['#dfb66c','#7bc2c8','#c47ea5','#c8d1df'][i%4]}));
    let trees = [];
    const artwork = new Image();
    artwork.onload = () => {
        if (destroyed) return;
        // Feathered patches from the SAME artwork: only small tree canopies sway.
        // Cached day/dusk sprites avoid filtering large bitmaps every frame.
        trees = CANOPIES.map(([x,y,rx,ry],i) => {
            const make = isDay => {
                const sprite=document.createElement('canvas'); sprite.width=rx*2; sprite.height=ry*2;
                const c=sprite.getContext('2d');
                c.filter=isDay?'saturate(1.1) brightness(1.05)':'saturate(1.16) brightness(.85) contrast(1.08)';
                c.drawImage(artwork,x-rx,y-ry,rx*2,ry*2,0,0,rx*2,ry*2);
                c.filter='none'; c.globalCompositeOperation='destination-in';
                c.setTransform(rx*2,0,0,ry*2,0,0);
                const mask=c.createRadialGradient(.5,.5,.22,.5,.5,.5);
                mask.addColorStop(0,'#fff'); mask.addColorStop(1,'transparent');
                c.fillStyle=mask; c.fillRect(0,0,1,1); return sprite;
            };
            return {x,y,rx,ry,phase:i*1.7,day:make(true),dusk:make(false)};
        });
        canvas.dataset.ready='true'; draw();
    };
    artwork.onerror = () => { if (!destroyed) canvas.dataset.ready='true'; };
    artwork.src='assets/uet-retro-campus-map-v2.png';

    function project() {
        const origin=map.latLngToContainerPoint([HEIGHT,0]);
        const corner=map.latLngToContainerPoint([0,WIDTH]);
        projection={x:origin.x,y:origin.y,scale:(corner.x-origin.x)/WIDTH};
        draw();
    }
    function resize() {
        const size=map.getSize(); viewWidth=size.x; viewHeight=size.y;
        ratio=Math.min(window.devicePixelRatio||1,1.5);
        canvas.width=Math.round(viewWidth*ratio); canvas.height=Math.round(viewHeight*ratio);
        canvas.style.width=`${viewWidth}px`; canvas.style.height=`${viewHeight}px`;
        project();
    }
    function onScreen(x,y,padding=45) {
        return x*projection.scale+projection.x>-padding && x*projection.scale+projection.x<viewWidth+padding &&
            y*projection.scale+projection.y>-padding && y*projection.scale+projection.y<viewHeight+padding;
    }
    function drawCar(car) {
        const p=car.path(car.offset+time*car.speed); if (!onScreen(p.x,p.y)) return;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle);
        ctx.fillStyle='#04172670'; ctx.fillRect(-7,-3,16,8);
        ctx.fillStyle='#202a30'; ctx.fillRect(-5,-4,3,2); ctx.fillRect(3,-4,3,2);
        ctx.fillRect(-5,3,3,2); ctx.fillRect(3,3,3,2);
        ctx.fillStyle=car.color; ctx.fillRect(-7,-3,14,7);
        ctx.fillStyle='#223c4c'; ctx.fillRect(1,-2,3,5); ctx.fillRect(-5,-2,2,5);
        ctx.fillStyle='#fbe4a8'; ctx.fillRect(6,-2,1,1); ctx.fillRect(6,2,1,1);
        if (!day) {
            ctx.fillStyle='rgba(255,228,170,.15)'; ctx.beginPath(); ctx.moveTo(7,-2);
            ctx.lineTo(28,-8); ctx.lineTo(28,8); ctx.lineTo(7,3); ctx.fill();
            ctx.fillStyle='#db7254'; ctx.fillRect(-7,-2,1,1); ctx.fillRect(-7,2,1,1);
        }
        ctx.restore();
    }
    function drawStudent(student,i) {
        const p=student.path(student.offset+time*student.speed); if(!onScreen(p.x,p.y)) return;
        const step=Math.sin(time*8+i)*1.15;
        ctx.save(); ctx.translate(p.x,p.y);
        ctx.fillStyle='#08172360'; ctx.beginPath(); ctx.ellipse(2,1,4,2,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#182536'; ctx.fillRect(-2,-2+step,1.6,4); ctx.fillRect(.5,-2-step,1.6,4);
        ctx.fillStyle=student.color; ctx.fillRect(-2.2,-6,4.4,5);
        ctx.fillStyle='#c39b77'; ctx.fillRect(-1.7,-9,3.4,3);
        ctx.fillStyle='#2e2630'; ctx.fillRect(-1.7,-10,3.4,1.6);
        ctx.restore();
    }
    function drawWater() {
        WATER.forEach(([x,y,rx,ry],i)=>{
            if(!onScreen(x,y)) return;
            ctx.save(); ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.clip();
            ctx.fillStyle='rgba(81,185,211,.10)'; ctx.fill();
            for(let j=0;j<3;j++) {
                const progress=(time*.32+j/3+i*.21)%1;
                ctx.strokeStyle=`rgba(179,241,249,${(1-progress)*.7})`; ctx.lineWidth=.8;
                ctx.beginPath();ctx.ellipse(x,y,rx*progress,ry*progress,0,0,Math.PI*2);ctx.stroke();
            }
            ctx.restore();
        });
        [[185,218],[735,979]].forEach(([x,y])=>{
            if(!onScreen(x,y)) return;
            ctx.strokeStyle='rgba(184,238,242,.6)';ctx.lineWidth=1;
            for(let j=-1;j<=1;j++) {
                const wind=Math.sin(time*1.6)*2;
                ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+j*8+wind,y-17,x+j*9,y+2);ctx.stroke();
                ctx.fillStyle='#c9f4f4';ctx.fillRect(x+j*6+wind,y-12+Math.sin(time*4+j)*3,1,2);
            }
        });
    }
    function drawBirds() {
        for(let flock=0;flock<2;flock++) {
            const x=((time*23+flock*850)%2000)-180;
            const y=400+flock*240+Math.sin(time*.12+flock)*55;
            for(let i=0;i<4;i++) {
                const bx=x-i*20, by=y+(i%2?1:-1)*i*7;
                if(!onScreen(bx,by)) continue;
                const flap=Math.sin(time*6+i)*3;
                ctx.strokeStyle='#0b2430';ctx.lineWidth=1.7;
                ctx.beginPath();ctx.moveTo(bx-5,by-flap);ctx.quadraticCurveTo(bx-2,by-2,bx,by);
                ctx.quadraticCurveTo(bx+2,by-2,bx+5,by-flap);ctx.stroke();
                ctx.strokeStyle='#d9e1c5b0';ctx.lineWidth=.6;ctx.stroke();
            }
        }
    }
    function draw() {
        if (destroyed || zooming) return;
        ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();
        ctx.setTransform(ratio*projection.scale,0,0,ratio*projection.scale,ratio*projection.x,ratio*projection.y);
        ctx.beginPath();ctx.rect(0,0,WIDTH,HEIGHT);ctx.clip();
        trees.forEach(tree=>{
            if(!onScreen(tree.x,tree.y)) return;
            const breeze=Math.sin(time*1.5+tree.phase);
            ctx.save();ctx.translate(tree.x+breeze*1.7,tree.y+Math.cos(time*1.2+tree.phase)*.7);
            ctx.rotate(breeze*.035);ctx.drawImage(day?tree.day:tree.dusk,-tree.rx,-tree.ry);ctx.restore();
        });
        drawWater(); cars.forEach(drawCar); students.forEach(drawStudent);
        if(!day) {
            LAMPS.forEach(([x,y],i)=>{
                if(!onScreen(x,y)) return;
                ctx.globalAlpha=.78+Math.sin(time*.65+i)*.12;
                ctx.drawImage(lamplight,x-22,y-9,44,22);
                ctx.fillStyle='#ffe6a3';ctx.fillRect(x-1,y-3,2,2);
            });
            ctx.globalAlpha=1;
            CANOPIES.forEach(([x,y],i)=>{
                const fx=x+Math.sin(time*.55+i*2)*19, fy=y+Math.cos(time*.45+i)*12;
                if(!onScreen(fx,fy)) return;
                ctx.globalAlpha=.25+(Math.sin(time*1.6+i)+1)*.3;
                ctx.drawImage(firelight,fx-5,fy-5,10,10);
            });ctx.globalAlpha=1;
        }
        // Broad, soft cloud shadows move over the actual buildings and grounds.
        for(let i=0;i<3;i++) {
            const cx=((time*9+i*650)%2600)-550, cy=150+i*285+Math.sin(time*.09+i)*55;
            ctx.drawImage(cloud,cx,cy,740,340);
            ctx.globalAlpha=day ? .6 : 1;ctx.drawImage(haze,cx+210,cy+180,670,140);ctx.globalAlpha=1;
        }
        drawBirds();ctx.restore();
    }
    function tick(now) {
        if (!active || destroyed) return;
        const interval=viewWidth<769?50:1000/30;
        if(now-lastFrame>=interval) {
            time+=Math.min((now-lastFrame)/1000,.1);lastFrame=now;draw();
        }
        frame=requestAnimationFrame(tick);
    }
    function sync() {
        cancelAnimationFrame(frame);
        active=enabled && visible && !document.hidden && !destroyed;
        canvas.dataset.motion=active?'running':'paused';
        onMotionChange(enabled);
        if(active) {lastFrame=performance.now();frame=requestAnimationFrame(tick);}
        else draw();
    }
    function startZoom(){zooming=true;canvas.style.opacity='0';}
    function endZoom(){zooming=false;canvas.style.opacity='1';project();}
    const visibility=()=>sync();
    const reducedChange=()=>{if(media.matches){enabled=false;motionPreference=false;}sync();};
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});
    observer.observe(container);
    document.addEventListener('visibilitychange',visibility);
    media.addEventListener('change',reducedChange);
    map.on('move',project);map.on('resize',resize);map.on('zoomstart',startZoom);map.on('zoomend',endZoom);
    resize();sync();
    return {
        toggle(){enabled=!enabled;motionPreference=enabled;sync();return enabled;},
        setDay(value){day=value;draw();},
        destroy(){destroyed=true;active=false;savedTime=time;cancelAnimationFrame(frame);observer.disconnect();
            document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',reducedChange);
            map.off('move',project);map.off('resize',resize);map.off('zoomstart',startZoom);map.off('zoomend',endZoom);
            artwork.onload=artwork.onerror=null;trees=[];canvas.remove();}
    };
}
