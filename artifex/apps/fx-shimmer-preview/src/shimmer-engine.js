const TAU = Math.PI * 2;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const clamp01=(v)=>clamp(v,0,1);
const scale=(a,b,t)=>a+(b-a)*clamp01(t);
const smoothstep=(a,b,v)=>{const t=clamp01((v-a)/Math.max(.0001,b-a));return t*t*(3-2*t);};
const fract=(v)=>v-Math.floor(v);
const hash1=(v)=>fract(Math.sin(v*127.1)*43758.5453123);
const hash2=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453123);
function hexToRgb(hex){const s=String(hex||'#fff').replace('#','').trim();const f=s.length===3?s.split('').map(c=>c+c).join(''):s.padEnd(6,'0').slice(0,6);const n=parseInt(f,16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
function rgba(hex,a=1){const c=hexToRgb(hex);return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;}
function cover(iw,ih,w,h){const ir=iw/Math.max(1,ih),tr=w/Math.max(1,h);let dw=w,dh=h;if(ir>tr){dh=h;dw=dh*ir}else{dw=w;dh=dw/ir}return{x:(w-dw)/2,y:(h-dh)/2,w:dw,h:dh};}

export class ShimmerDistortionEngine{
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');
    this.sourceCanvas=document.createElement('canvas');this.source=this.sourceCanvas.getContext('2d');
    this.lowCanvas=document.createElement('canvas');this.low=this.lowCanvas.getContext('2d');
    this.textureImage=null;this.values={};
  }
  setValues(v){this.values={...v};}
  setTextureImage(img=null){this.textureImage=img;}
  resize(){
    const ratio=Math.max(1,Math.min(1.5,window.devicePixelRatio||1));
    const r=this.canvas.getBoundingClientRect();
    const w=Math.max(720,Math.round(r.width*ratio)),h=Math.max(405,Math.round(r.height*ratio));
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.sourceCanvas.width=w;this.sourceCanvas.height=h;}
    const rs=clamp(this.values.renderScale??58,35,100)/100;
    const lw=Math.max(260,Math.round(w*rs)),lh=Math.max(146,Math.round(h*rs));
    if(this.lowCanvas.width!==lw||this.lowCanvas.height!==lh){this.lowCanvas.width=lw;this.lowCanvas.height=lh;}
  }
  geom(t){
    const v=this.values,w=this.canvas.width,h=this.canvas.height;
    const base=Math.min(w,h)*scale(.08,.62,(v.radius??60)/100);
    const pulse=1+Math.sin(t*scale(.4,4,(v.pulse??45)/100))*.035*((v.loopIntensity??50)/100);
    return{w,h,cx:w*((v.positionX??50)/100),cy:h*((v.positionY??50)/100),base,rx:base*((v.scaleX??100)/100)*pulse,ry:base*((v.scaleY??100)/100)*pulse};
  }
  draw(t=0){this.resize();const g=this.geom(t);this.drawSource(t,g);this.drawDistorted(t,g);this.drawGlow(g);}
  drawSource(t,g){
    const v=this.values,ctx=this.source,w=this.sourceCanvas.width,h=this.sourceCanvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle=v.backdropColor||'#09080f';ctx.fillRect(0,0,w,h);
    const bg=ctx.createRadialGradient(g.cx,g.cy,0,g.cx,g.cy,Math.max(g.rx,g.ry)*1.8);
    bg.addColorStop(0,rgba(v.coreColor,.24));bg.addColorStop(.45,rgba(v.rimColor,.12));bg.addColorStop(1,rgba(v.backdropColor,0));
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    if(v.showGrid) this.drawGrid(ctx,w,h,t);
    this.drawCore(ctx,g,t);this.drawCloudRim(ctx,g,t);this.drawWisps(ctx,g,t);this.drawParticles(ctx,g,t);
  }
  drawGrid(ctx,w,h,t){
    const v=this.values,major=Math.max(38,Math.round(w/15)),minor=Math.max(19,Math.round(w/30));ctx.lineWidth=Math.max(1,w/1000);
    for(let x=0;x<=w;x+=minor){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.strokeStyle=x%major===0?rgba(v.coreColor,.18):rgba(v.coreColor,.055);ctx.stroke();}
    for(let y=0;y<=h;y+=minor){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.strokeStyle=y%major===0?rgba(v.rimColor,.14):rgba(v.rimColor,.045);ctx.stroke();}
    ctx.globalAlpha=.1;ctx.strokeStyle=rgba(v.accentColor,.8);for(let i=0;i<5;i++){ctx.beginPath();for(let x=-20;x<=w+20;x+=22){const yy=h*(.18+i*.14)+Math.sin(x*.012+t*(1+i*.1))*h*.02;if(x<0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);}ctx.stroke();}ctx.globalAlpha=1;
  }
  drawCore(ctx,g,t){
    const v=this.values;ctx.save();ctx.translate(g.cx,g.cy);ctx.beginPath();ctx.ellipse(0,0,g.rx,g.ry,0,0,TAU);ctx.clip();
    const grad=ctx.createLinearGradient(-g.rx,-g.ry,g.rx,g.ry);grad.addColorStop(0,rgba(v.coreColor,.18));grad.addColorStop(.5,rgba(v.accentColor,.08));grad.addColorStop(1,rgba(v.rimColor,.16));ctx.fillStyle=grad;ctx.fillRect(-g.rx*1.4,-g.ry*1.4,g.rx*2.8,g.ry*2.8);
    if(v.sourceMode==='texture'&&this.textureImage){const c=cover(this.textureImage.width,this.textureImage.height,g.rx*2.7,g.ry*2.25);ctx.globalAlpha=scale(.15,.9,(v.textureStrength??70)/100);ctx.drawImage(this.textureImage,c.x-g.rx*1.35,c.y-g.ry*1.12,c.w,c.h);ctx.globalAlpha=1;}
    ctx.restore();
  }
  drawCloudRim(ctx,g,t){
    const v=this.values,rw=scale(8,58,(v.rimWidth??50)/100),alpha=scale(.05,.76,(v.rimAlpha??50)/100),cloud=scale(.2,1.2,(v.cloudiness??60)/100),count=Math.round(scale(28,96,(v.cloudiness??60)/100));
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let layer=0;layer<3;layer++)for(let i=0;i<count;i++){const seed=i*1.731+layer*19.3;const a=TAU*i/count+Math.sin(t*.45+seed)*.08;const rough=(hash2(Math.cos(a)*7+seed,t*.08+Math.sin(a)*9)-.5)*rw*cloud;const x=g.cx+Math.cos(a)*(g.rx+rough);const y=g.cy+Math.sin(a)*(g.ry+rough);const bw=rw*scale(.28,1.55,hash1(seed+2));const bh=rw*scale(.16,.85,hash1(seed+4));ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.sin(seed)*.5);ctx.fillStyle=rgba(layer===1?v.accentColor:layer===2?v.coreColor:v.rimColor,alpha*(layer===1?.22:.48));ctx.shadowColor=layer===1?v.accentColor:v.rimColor;ctx.shadowBlur=scale(12,46,(v.glow??50)/100);ctx.beginPath();ctx.ellipse(0,0,bw,bh,0,0,TAU);ctx.fill();ctx.restore();}
    ctx.restore();
  }
  drawWisps(ctx,g,t){
    const v=this.values,n=Math.round(scale(0,38,(v.wispAmount??0)/100));if(!n)return;const sp=scale(.12,1.8,(v.wispSpeed??40)/100),sz=scale(6,42,(v.wispSize??50)/100),curl=scale(0,1.4,(v.wispCurl??40)/100);ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const seed=i*7.17,p=fract(t*sp*.14+hash1(seed)),a=TAU*hash1(seed+8)+Math.sin(t*.6+seed)*curl,d=scale(g.base*.08,g.base*1.35,p),x=g.cx+Math.cos(a)*d*(g.rx/g.base),y=g.cy+Math.sin(a)*d*(g.ry/g.base),s=sz*(1-p*.55)*(0.6+hash1(seed+3)*.7),al=(.14+hash1(seed+1)*.2)*(1-p);ctx.fillStyle=rgba(i%2?v.coreColor:v.accentColor,al);ctx.shadowColor=i%2?v.coreColor:v.rimColor;ctx.shadowBlur=s*1.3;ctx.beginPath();ctx.ellipse(x,y,s,s*.55,a,0,TAU);ctx.fill();}
    ctx.restore();
  }
  drawParticles(ctx,g,t){
    const v=this.values,n=Math.round(scale(0,74,(v.particleAmount??0)/100));if(!n)return;const sp=scale(.18,2.5,(v.particleSpeed??40)/100),spr=scale(.1,1.8,(v.particleSpread??50)/100),sz=scale(1.4,7,(v.particleSize??25)/100);ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const seed=i*17.2,p=fract(t*sp*.22+hash1(seed+4)),a=TAU*hash1(seed+1)+Math.sin(t*.8+seed)*spr,d=scale(g.base*.05,g.base*1.6,p),x=g.cx+Math.cos(a)*d*(g.rx/g.base),y=g.cy+Math.sin(a)*d*(g.ry/g.base),s=sz*(1-p*.65)*(0.7+hash1(seed+6)*.6),al=(.18+hash1(seed+7)*.52)*(1-p);ctx.fillStyle=rgba(i%3===0?v.accentColor:i%2?v.rimColor:v.coreColor,al);ctx.shadowColor=i%2?v.rimColor:v.coreColor;ctx.shadowBlur=s*4;ctx.beginPath();ctx.arc(x,y,s,0,TAU);ctx.fill();}
    ctx.restore();
  }
  drawDistorted(t,g){
    const v=this.values,lw=this.lowCanvas.width,lh=this.lowCanvas.height,fw=this.sourceCanvas.width,fh=this.sourceCanvas.height,low=this.low,ctx=this.ctx;
    low.clearRect(0,0,lw,lh);low.drawImage(this.sourceCanvas,0,0,lw,lh);
    const cx=g.cx*lw/fw,cy=g.cy*lh/fh,rx=g.rx*lw/fw,ry=g.ry*lh/fh,cell=clamp(v.cellSize??6,3,12),soft=scale(.06,.55,(v.softness??50)/100),str=scale(0,32,(v.strength??50)/100)*lw/fw,ref=scale(0,18,(v.refraction??50)/100)*lw/fw,waveSize=scale(.008,.09,(v.waveSize??40)/100),waveSpeed=scale(.15,4.8,(v.waveSpeed??40)/100),swirl=scale(-1.8,1.8,((v.swirl??0)+100)/200),noise=scale(0,12,(v.noise??30)/100)*lw/fw,chrom=scale(0,5.5,(v.chromatic??20)/100)*lw/fw;
    const pad=Math.ceil(Math.max(rx,ry)*.2),minX=Math.max(0,Math.floor(cx-rx-pad)),maxX=Math.min(lw,Math.ceil(cx+rx+pad)),minY=Math.max(0,Math.floor(cy-ry-pad)),maxY=Math.min(lh,Math.ceil(cy+ry+pad)),sx=fw/lw,sy=fh/lh,sw=Math.ceil(sx*cell),sh=Math.ceil(sy*cell);
    for(let y=minY;y<maxY;y+=cell)for(let x=minX;x<maxX;x+=cell){const nx=(x+cell*.5-cx)/rx,ny=(y+cell*.5-cy)/ry,dist=Math.sqrt(nx*nx+ny*ny),inside=1-smoothstep(1-soft,1.08,dist);if(inside<=.005)continue;const a=Math.atan2(ny,nx),phase=t*waveSpeed;let wav=Math.sin(dist/waveSize+phase+Math.sin(a*3+phase)*.65);if(v.type==='heat')wav=Math.sin(y*waveSize*2.6+phase*2.2)*.78+Math.sin(y*waveSize*5.4-phase)*.22;else if(v.type==='dream')wav=Math.sin(dist/waveSize-phase)*.55+Math.sin((nx-ny)*6+phase*.7)*.45;else if(v.type==='transition')wav=Math.sign(Math.sin((x+y)*waveSize*3+phase*3))*.55+Math.sin(a*8+phase)*.45;const rough=(hash2(x*.08+phase,y*.08-phase)-.5)*noise,dx=(Math.cos(a)*(str*wav+ref)-Math.sin(a)*swirl*12+rough)*inside,dy=(Math.sin(a)*(str*wav+ref)+Math.cos(a)*swirl*12-rough)*inside;if(chrom>.1&&inside>.15){low.globalCompositeOperation='lighter';low.globalAlpha=.18*inside;low.drawImage(this.sourceCanvas,(x+dx-chrom)*sx,(y+dy)*sy,sw,sh,x,y,cell+1,cell+1);low.drawImage(this.sourceCanvas,(x+dx+chrom)*sx,(y+dy)*sy,sw,sh,x,y,cell+1,cell+1);low.globalAlpha=1;low.globalCompositeOperation='source-over';}low.drawImage(this.sourceCanvas,(x+dx)*sx,(y+dy)*sy,sw,sh,x,y,cell+1,cell+1);}
    ctx.clearRect(0,0,fw,fh);ctx.imageSmoothingEnabled=true;ctx.drawImage(this.lowCanvas,0,0,fw,fh);
  }
  drawGlow(g){const v=this.values,ctx=this.ctx,glow=scale(0,.82,(v.glow??50)/100);if(!glow)return;const grad=ctx.createRadialGradient(g.cx,g.cy,g.base*.25,g.cx,g.cy,Math.max(g.rx,g.ry)*1.8);grad.addColorStop(0,rgba(v.coreColor,glow*.1));grad.addColorStop(.45,rgba(v.rimColor,glow*.08));grad.addColorStop(1,rgba(v.rimColor,0));ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(g.cx,g.cy,g.rx*1.75,g.ry*1.45,0,0,TAU);ctx.fill();}
}
