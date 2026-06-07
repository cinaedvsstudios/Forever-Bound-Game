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
    const rs=clamp(this.values.renderScale??82,50,100)/100;
    const lw=Math.max(360,Math.round(w*rs)),lh=Math.max(203,Math.round(h*rs));
    if(this.lowCanvas.width!==lw||this.lowCanvas.height!==lh){this.lowCanvas.width=lw;this.lowCanvas.height=lh;}
  }
  geom(t){
    const v=this.values,w=this.canvas.width,h=this.canvas.height;
    const base=Math.min(w,h)*scale(.08,.62,(v.radius??60)/100);
    const pulse=1+Math.sin(t*scale(.4,4,(v.pulse??45)/100))*.035*((v.loopIntensity??50)/100);
    return{w,h,cx:w*((v.positionX??50)/100),cy:h*((v.positionY??50)/100),base,rx:Math.max(.01,base*((v.scaleX??100)/100)*pulse),ry:Math.max(.01,base*((v.scaleY??100)/100)*pulse)};
  }
  draw(t=0){this.resize();const g=this.geom(t);this.drawSource(t,g);this.drawDistorted(t,g);this.drawGlow(g);}
  drawSource(t,g){
    const v=this.values,ctx=this.source,w=this.sourceCanvas.width,h=this.sourceCanvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle=v.backdropColor||'#09080f';ctx.fillRect(0,0,w,h);
    const bg=ctx.createRadialGradient(g.cx,g.cy,0,g.cx,g.cy,Math.max(g.rx,g.ry)*1.8);
    bg.addColorStop(0,rgba(v.coreColor,.24));bg.addColorStop(.45,rgba(v.rimColor,.12));bg.addColorStop(1,rgba(v.backdropColor,0));
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    if(v.showGrid) this.drawGrid(ctx,w,h,t);
    this.drawCore(ctx,g,t);if(v.type!=='heat'){this.drawCloudRim(ctx,g,t);this.drawWisps(ctx,g,t);this.drawParticles(ctx,g,t);}
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
    const v=this.values,rw=scale(20,90,(v.rimWidth??75)/100),alpha=scale(.14,.95,(v.rimAlpha??85)/100),cloud=scale(.65,2.0,(v.cloudiness??95)/100),n=Math.round(scale(70,170,(v.cloudiness??95)/100)),blur=scale(20,76,(v.glow??75)/100);
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let layer=0;layer<4;layer++){
      for(let i=0;i<n;i++){
        const seed=i*1.273+layer*19.17,a=TAU*(i/n)+Math.sin(t*.34+seed)*.12,roughA=(hash2(Math.cos(a)*5.7+layer,Math.sin(a)*6.2+t*.12)-.5)*cloud,roughB=(hash1(seed+t*.045)-.5)*cloud,rx=g.rx+roughA*rw*1.55+Math.sin(seed+t*.28)*rw*.45,ry=g.ry+roughB*rw*1.25+Math.cos(seed*.7-t*.22)*rw*.38,x=g.cx+Math.cos(a)*rx,y=g.cy+Math.sin(a)*ry,bw=rw*scale(.32,1.85,hash1(seed+3.1)),bh=rw*scale(.18,1.12,hash1(seed+4.6)),rot=a+Math.sin(seed)*.8+t*.05,col=layer===1?v.accentColor:layer===2?v.coreColor:v.rimColor;
        ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=rgba(col,alpha*(layer===1?.24:.40));ctx.shadowColor=col;ctx.shadowBlur=blur;ctx.beginPath();ctx.ellipse(0,0,bw,bh,0,0,TAU);ctx.fill();ctx.restore();
      }
    }
    for(let ring=0;ring<5;ring++){
      const steps=150,skip=.33+ring*.055;ctx.lineWidth=Math.max(1,rw*(.08+ring*.018));ctx.strokeStyle=rgba(ring%2?v.accentColor:v.rimColor,alpha*(.30-ring*.025));ctx.shadowColor=ring%2?v.accentColor:v.rimColor;ctx.shadowBlur=blur*.75;
      for(let i=0;i<steps;i++){
        const a0=TAU*(i/steps),a1=TAU*((i+.66)/steps),vis=hash2(Math.cos(a0)*8.1+ring*2.3,Math.sin(a0)*9.4+t*.22);if(vis<skip)continue;
        const n0=(hash2(Math.cos(a0)*11+ring,Math.sin(a0)*13+t*.18)-.5)*rw*cloud,n1=(hash2(Math.cos(a1)*11+ring,Math.sin(a1)*13+t*.18)-.5)*rw*cloud,x0=g.cx+Math.cos(a0)*(g.rx+n0+ring*rw*.12),y0=g.cy+Math.sin(a0)*(g.ry+n0*.75+ring*rw*.08),xm=g.cx+Math.cos((a0+a1)/2)*(g.rx+(n0+n1)*.6+ring*rw*.12),ym=g.cy+Math.sin((a0+a1)/2)*(g.ry+(n0+n1)*.42+ring*rw*.08),x1=g.cx+Math.cos(a1)*(g.rx+n1+ring*rw*.12),y1=g.cy+Math.sin(a1)*(g.ry+n1*.75+ring*rw*.08);
        ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(xm,ym,x1,y1);ctx.stroke();
      }
    }
    ctx.restore();
  }
  drawWisps(ctx,g,t){
    const v=this.values,n=Math.round(scale(0,82,(v.wispAmount??85)/100));if(!n)return;const sp=scale(.25,2.5,(v.wispSpeed??60)/100),sz=scale(14,82,(v.wispSize??75)/100),curl=scale(.18,2.6,(v.wispCurl??75)/100);
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){
      const seed=i*7.17,p=fract(t*sp*.11+hash1(seed)),a=TAU*hash1(seed+8)+Math.sin(t*.58+seed)*curl,d=scale(g.base*.02,g.base*1.75,p),x=g.cx+Math.cos(a)*d*(g.rx/g.base),y=g.cy+Math.sin(a)*d*(g.ry/g.base),s=sz*(1-p*.5)*(0.7+hash1(seed+3)*.75),al=(.32+hash1(seed+1)*.36)*Math.sin((1-p)*Math.PI)*.86;
      for(let b=0;b<4;b++){const ox=(hash1(seed+b*1.3)-.5)*s*1.15,oy=(hash1(seed+b*2.1)-.5)*s*1.15,col=b===1?v.coreColor:b===2?v.rimColor:v.accentColor;ctx.fillStyle=rgba(col,al*(b===1?.62:.40));ctx.shadowColor=col;ctx.shadowBlur=s*1.9;ctx.beginPath();ctx.ellipse(x+ox,y+oy,s*(1.38-b*.16),s*(.44+hash1(seed+b)*.5),a+b*.42,0,TAU);ctx.fill();}
    }
    ctx.restore();
  }
  drawParticles(ctx,g,t){
    const v=this.values,n=Math.round(scale(0,128,(v.particleAmount??70)/100));if(!n)return;const sp=scale(.25,3.35,(v.particleSpeed??60)/100),spr=scale(.18,2.5,(v.particleSpread??80)/100),sz=scale(2.4,12.5,(v.particleSize??45)/100);
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){
      const seed=i*17.17,p=fract(t*sp*.2+hash1(seed+2.9)),a=TAU*hash1(seed+1.1)+Math.sin(t*.7+seed)*spr,d=scale(g.base*.05,g.base*1.85,p),x=g.cx+Math.cos(a)*d*(g.rx/g.base),y=g.cy+Math.sin(a)*d*(g.ry/g.base),s=sz*(1-p*.58)*(0.7+hash1(seed+3.6)*.65),al=(.34+hash1(seed+4.2)*.64)*Math.sin((1-p)*Math.PI),col=i%3===0?v.accentColor:i%2===0?v.coreColor:v.rimColor;
      ctx.fillStyle=rgba(col,al);ctx.shadowColor=col;ctx.shadowBlur=s*6;ctx.beginPath();ctx.arc(x,y,s,0,TAU);ctx.fill();ctx.strokeStyle=rgba(col,al*.38);ctx.lineWidth=Math.max(1,s*.35);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a)*s*5,y-Math.sin(a)*s*5);ctx.stroke();
    }
    ctx.restore();
  }
  drawDistorted(t,g){
    const v=this.values,lw=this.lowCanvas.width,lh=this.lowCanvas.height,fw=this.sourceCanvas.width,fh=this.sourceCanvas.height,low=this.low,ctx=this.ctx;
    low.clearRect(0,0,lw,lh);low.drawImage(this.sourceCanvas,0,0,lw,lh);
    const cx=g.cx*lw/fw,cy=g.cy*lh/fh,rx=Math.max(1,g.rx*lw/fw),ry=Math.max(1,g.ry*lh/fh),cell=clamp(v.cellSize??2,1,10),soft=scale(.06,.55,(v.softness??50)/100),str=scale(0,32,(v.strength??50)/100)*lw/fw,ref=scale(0,18,(v.refraction??50)/100)*lw/fw,waveSize=scale(.008,.09,(v.waveSize??40)/100),waveSpeed=scale(.15,4.8,(v.waveSpeed??40)/100),swirl=scale(-1.8,1.8,((v.swirl??0)+100)/200),noise=scale(0,12,(v.noise??30)/100)*lw/fw,chrom=scale(0,5.5,(v.chromatic??20)/100)*lw/fw;
    const pad=Math.ceil(Math.max(rx,ry)*.2),minX=Math.max(0,Math.floor(cx-rx-pad)),maxX=Math.min(lw,Math.ceil(cx+rx+pad)),minY=Math.max(0,Math.floor(cy-ry-pad)),maxY=Math.min(lh,Math.ceil(cy+ry+pad)),sx=fw/lw,sy=fh/lh,sw=Math.ceil(sx*cell),sh=Math.ceil(sy*cell);
    for(let y=minY;y<maxY;y+=cell)for(let x=minX;x<maxX;x+=cell){const nx=(x+cell*.5-cx)/rx,ny=(y+cell*.5-cy)/ry,dist=Math.sqrt(nx*nx+ny*ny),inside=1-smoothstep(1-soft,1.08,dist);if(inside<=.005)continue;const a=Math.atan2(ny,nx),phase=t*waveSpeed;let wav=Math.sin(dist/waveSize+phase+Math.sin(a*3+phase)*.65);if(v.type==='heat')wav=Math.sin(y*waveSize*2.6+phase*2.2)*.78+Math.sin(y*waveSize*5.4-phase)*.22;else if(v.type==='dream')wav=Math.sin(dist/waveSize-phase)*.55+Math.sin((nx-ny)*6+phase*.7)*.45;else if(v.type==='transition')wav=Math.sign(Math.sin((x+y)*waveSize*3+phase*3))*.55+Math.sin(a*8+phase)*.45;const rough=(hash2(x*.08+phase,y*.08-phase)-.5)*noise,dx=(Math.cos(a)*(str*wav+ref)-Math.sin(a)*swirl*12+rough)*inside,dy=(Math.sin(a)*(str*wav+ref)+Math.cos(a)*swirl*12-rough)*inside;if(chrom>.1&&inside>.15){low.globalCompositeOperation='lighter';low.globalAlpha=.18*inside;low.drawImage(this.sourceCanvas,(x+dx-chrom)*sx,(y+dy)*sy,sw,sh,x,y,cell+1,cell+1);low.drawImage(this.sourceCanvas,(x+dx+chrom)*sx,(y+dy)*sy,sw,sh,x,y,cell+1,cell+1);low.globalAlpha=1;low.globalCompositeOperation='source-over';}low.drawImage(this.sourceCanvas,(x+dx)*sx,(y+dy)*sy,sw,sh,x,y,cell+1,cell+1);}
    ctx.clearRect(0,0,fw,fh);ctx.imageSmoothingEnabled=true;ctx.drawImage(this.lowCanvas,0,0,fw,fh);
  }
  drawGlow(g){
    const v=this.values,ctx=this.ctx,glow=scale(0,.82,(v.glow??50)/100);if(!glow)return;
    ctx.save();ctx.globalCompositeOperation='lighter';
    const grad=ctx.createRadialGradient(g.cx,g.cy,g.base*.25,g.cx,g.cy,Math.max(g.rx,g.ry)*1.95);grad.addColorStop(0,rgba(v.coreColor,glow*.10));grad.addColorStop(.45,rgba(v.rimColor,glow*.08));grad.addColorStop(1,rgba(v.rimColor,0));ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(g.cx,g.cy,g.rx*1.82,g.ry*1.52,0,0,TAU);ctx.fill();
    // No perfect ellipse stroke in V1.02. The mask is now short broken sparks only.
    if(v.showMask){const a=scale(.04,.28,(v.rimAlpha??50)/100),rw=scale(1,5,(v.rimWidth??50)/100);ctx.shadowColor=v.rimColor;ctx.shadowBlur=20;for(let i=0;i<42;i++){const seed=i*3.19,a0=TAU*hash1(seed+Math.floor(performance.now()/500)*.01),a1=a0+scale(.02,.09,hash1(seed+9.4)),n=(hash1(seed+performance.now()*.00012)-.5)*g.base*.15;ctx.strokeStyle=rgba(i%2?v.accentColor:v.rimColor,a);ctx.lineWidth=rw*(.6+hash1(seed+2.2)*1.4);ctx.beginPath();ctx.moveTo(g.cx+Math.cos(a0)*(g.rx+n),g.cy+Math.sin(a0)*(g.ry+n*.72));ctx.lineTo(g.cx+Math.cos(a1)*(g.rx+n),g.cy+Math.sin(a1)*(g.ry+n*.72));ctx.stroke();}}
    ctx.restore();
  }
}
