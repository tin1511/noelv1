// ===== CẤU HÌNH: sửa tại đây =====
const CONFIG={
 N:matchMedia("(pointer:coarse)").matches?5500:9000, // số hạt (máy yếu tự giảm)
 merry:"Merry Christmas", greeting:"Hello mấy cu",
 santaT:6.5, merryT:3.8, greetT:3.4, envT:2.6, treeSpin:0.12,
 letter:["Gửi người em thương,","Giáng Sinh này anh chỉ mong có em bên cạnh.","Mỗi tấm ảnh trên cây là một ngày anh trân trọng.","Merry Christmas, mãi yêu em ❤"],
 photos:[{e:"🥰",t:"Lần đầu mình gặp nhau",d:"Kỷ niệm 1"},{e:"🍜",t:"Bữa ăn đáng nhớ",d:"Kỷ niệm 2"},{e:"🌅",t:"Buổi chiều bên nhau",d:"Kỷ niệm 3"},{e:"🎬",t:"Hôm đi xem phim",d:"Kỷ niệm 4"},{e:"🌸",t:"Chuyến đi đầu tiên",d:"Kỷ niệm 5"},{e:"💌",t:"Lời chúc đặc biệt",d:"Kỷ niệm 6"}]
};
const $=id=>document.getElementById(id),wait=ms=>new Promise(r=>setTimeout(r,ms));
const SCRIPT='"Segoe Script","Brush Script MT","Snell Roundhand",cursive,Georgia,serif';
const R=new THREE.WebGLRenderer({canvas:$("c"),antialias:true,alpha:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,100);cam.position.z=7.5;
const world=new THREE.Group();S.add(world);
let visW,visH;
function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();visH=2*Math.tan(25*Math.PI/180)*cam.position.z;visW=visH*cam.aspect}
addEventListener("resize",resize);resize();

// hạt phát sáng (giả bloom bằng additive + texture mềm)
function glow(){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"#fff");g.addColorStop(.3,"rgba(255,255,255,.6)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
const GT=glow(),N=CONFIG.N;
const pos=new Float32Array(N*3),col=new Float32Array(N*3),tp=new Float32Array(N*3),tc=new Float32Array(N*3),vel=new Float32Array(N*3);
for(let i=0;i<N*3;i++)pos[i]=(Math.random()-.5)*14;
const geo=new THREE.BufferGeometry();
geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("color",new THREE.BufferAttribute(col,3));
const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.085,map:GT,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
pts.frustumCulled=false;world.add(pts);

// tuyết 2 lớp + sao nền
function layer(n,size,op,zr,zo){const g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*18;a[i*3+1]=(Math.random()-.5)*12;a[i*3+2]=zo+Math.random()*zr}
 g.setAttribute("position",new THREE.BufferAttribute(a,3));const p=new THREE.Points(g,new THREE.PointsMaterial({size,map:GT,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending}));p.frustumCulled=false;S.add(p);return p}
const snowF=layer(350,.06,.55,4,-6),snowN=layer(70,.16,.35,2,3),stars=layer(140,.13,.8,1,-18);

// ===== Lấy mẫu hình vẽ thành điểm đích =====
function sample(cv,scale,ox,oy){const x=cv.getContext("2d"),w=cv.width,h=cv.height,d=x.getImageData(0,0,w,h).data,a=[];
 for(let y=0;y<h;y+=2)for(let u=0;u<w;u+=2){const i=(y*w+u)*4;if(d[i+3]>120)a.push([(u-w/2)*scale+ox,(h/2-y)*scale+oy,d[i]/255,d[i+1]/255,d[i+2]/255])}return a}
function fillList(a){const n=a.length;for(let i=0;i<N;i++){const p=a[(i*n/N)|0],j=i*3;tp[j]=p[0]+(Math.random()-.5)*.02;tp[j+1]=p[1]+(Math.random()-.5)*.02;tp[j+2]=(Math.random()-.5)*.18;tc[j]=p[2];tc[j+1]=p[3];tc[j+2]=p[4]}}
function textCv(t,fam,stops,w=900,h=300){const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d");let s=170;x.font=`italic 700 ${s}px ${fam}`;
 while(x.measureText(t).width>w-60&&s>20){s-=6;x.font=`italic 700 ${s}px ${fam}`}
 const g=x.createLinearGradient(0,0,w,0);stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));
 x.fillStyle=g;x.textAlign="center";x.textBaseline="middle";x.fillText(t,w/2,h/2);return cv}

// ông già Noel (2 khung hình chạy)
function santa(f){const cv=document.createElement("canvas");cv.width=300;cv.height=260;const x=cv.getContext("2d");
 const P=(c,fn)=>{x.fillStyle=c;x.beginPath();fn();x.fill()};
 const L=(c,w,p)=>{x.strokeStyle=c;x.lineWidth=w;x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.stroke()};
 // chân (2 nhịp chạy) + ủng
 const legs=f?[[150,205,140,232,130,248],[165,205,195,215,222,226]]:[[150,205,130,230,105,222],[165,205,195,225,215,243]];
 legs.forEach(l=>{L("#e02424",26,l);L("#a8642a",18,[l[4],l[5],l[4]+16,l[5]+2])});
 // bao quà sau lưng
 P("#c98a4b",()=>x.ellipse(82,120,40,36,0,0,7));P("#ffd23f",()=>x.roundRect(70,80,26,10,4));
 // thân, viền lông, thắt lưng
 P("#ff3b3b",()=>x.ellipse(165,150,50,56,.12,0,7));
 P("#fff",()=>x.roundRect(118,196,94,15,8));
 P("#ffd23f",()=>x.rect(118,150,96,12));P("#fff",()=>x.rect(155,147,18,18));
 // hai tay (đưa qua lại theo nhịp chạy)
 const a=f?8:-8;
 L("#e02424",22,[140,112,108,130+a]);P("#fff",()=>x.arc(104,132+a,12,0,7));
 L("#ff3b3b",22,[188,110,222,128-a]);P("#fff",()=>x.arc(228,130-a,12,0,7));
 // đầu, râu, ria, mũi, mắt
 P("#ffd0a8",()=>x.arc(208,84,30,0,7));
 P("#fff",()=>x.ellipse(212,114,32,28,0,0,7));
 P("#fff",()=>x.ellipse(226,92,16,8,0,0,7));
 P("#ff7a7a",()=>x.arc(236,84,5,0,7));
 P("#4a7bff",()=>x.arc(216,78,3.5,0,7));
 // mũ cụp xuống phía sau có cục bông
 P("#ff3b3b",()=>{x.moveTo(178,60);x.quadraticCurveTo(176,16,130,30);x.lineTo(136,48);x.quadraticCurveTo(170,42,240,62);x.closePath()});
 P("#fff",()=>x.roundRect(176,52,64,16,8));P("#fff",()=>x.arc(128,36,11,0,7));
 return cv}

// phong thư
function envelope(){const cv=document.createElement("canvas");cv.width=400;cv.height=280;const x=cv.getContext("2d");
 x.fillStyle="#ff4d5a";x.fillRect(30,50,340,200);x.fillStyle="#ff9aa2";x.beginPath();x.moveTo(30,50);x.lineTo(200,170);x.lineTo(370,50);x.closePath();x.fill();
 x.strokeStyle="#ffd36b";x.lineWidth=8;x.strokeRect(30,50,340,200);x.beginPath();x.moveTo(30,250);x.lineTo(160,150);x.moveTo(370,250);x.lineTo(240,150);x.stroke();
 x.fillStyle="#fff";x.font="70px Georgia,serif";x.textAlign="center";x.fillText("♥",200,215);return cv}

// cây thông 3D
let TS=1;
function genTree(){TS=Math.min(1,visW/4.2);const G=[[.1,.65,.28],[.06,.5,.22],[.25,.8,.35]],O=[[1,.2,.25],[1,.85,.3],[.35,.6,1],[1,.5,.9]];
 for(let i=0;i<N;i++){const j=i*3,r=Math.random();let x,y,z,c;
  if(r<.025){const a=Math.random()*6.283,q=.24*(.55+.45*Math.abs(Math.cos(2.5*a)));x=Math.cos(a)*q;y=2.5+Math.sin(a)*q;z=0;c=[1,.92,.4]}
  else if(r<.07){const a=Math.random()*6.283,q=Math.random()*.14;x=Math.cos(a)*q;z=Math.sin(a)*q;y=-2.65+Math.random()*.5;c=[.55,.33,.15]}
  else{const h=Math.pow(Math.random(),.9),Rr=h*1.75;let a=Math.random()*6.283,q;
   if(r<.17){a=h*28+(i%2)*3.14;q=Rr*1.03;c=[1,.85,.4]}
   else if(r<.23){q=Rr*.98;c=O[(Math.random()*4)|0]}
   else{q=Rr*Math.sqrt(Math.random());c=G[(Math.random()*3)|0]}
   x=Math.cos(a)*q;z=Math.sin(a)*q;y=2.2-h*4.4}
  tp[j]=x*TS;tp[j+1]=y*TS;tp[j+2]=z*TS;tc[j]=c[0];tc[j+1]=c[1];tc[j+2]=c[2]}}

// ảnh polaroid treo trên cây
const sprites=[];
CONFIG.photos.forEach((p,k)=>{const c=document.createElement("canvas");c.width=200;c.height=240;const x=c.getContext("2d");
 x.fillStyle="#fffaf0";x.fillRect(0,0,200,240);const g=x.createLinearGradient(0,0,200,200);g.addColorStop(0,"#ff9fb2");g.addColorStop(1,"#7a5cff");x.fillStyle=g;x.fillRect(14,14,172,172);
 x.font="88px serif";x.textAlign="center";x.textBaseline="middle";x.fillText(p.e,100,102);
 x.fillStyle="#5a2a1a";x.font='italic 16px Georgia,serif';x.fillText(p.t.slice(0,24),100,214);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:0}));
 s.userData={t:p.t,d:p.d,url:c.toDataURL(),k};s.visible=false;world.add(s);sprites.push(s)});
function placePhotos(){const H=[.25,.42,.58,.72,.35,.85];sprites.forEach((s,k)=>{const h=H[k],a=k*2.4,q=h*1.75*TS*1.1;s.position.set(Math.cos(a)*q,(2.2-h*4.4)*TS,Math.sin(a)*q);s.scale.set(.6*TS+.15,.72*TS+.18,1);s.visible=true})}

// ===== Trình tự cảnh =====
let scene=-1,sceneT=0,K=.14,D=.8,offX=0,offY=0,repel=true,curFi=-1,LT=0,SF,S1,mx=1e3,my=1e3,letterOn=false;
const DUR=[CONFIG.santaT,CONFIG.merryT,CONFIG.greetT];
function enter(i){scene=i;sceneT=0;offX=offY=0;repel=i<4;for(let j=0;j<N*3;j++)vel[j]+=(Math.random()-.5)*.25;
 if(i==0){K=.14;D=.8;curFi=-1}
 else if(i==1){K=.04;D=.88;fillList(sample(textCv(CONFIG.merry,SCRIPT,["#ff5a5a","#ffd36b","#fff"]),Math.min(visW*.92,9)/900,0,0))}
 else if(i==2){K=.04;D=.88;fillList(sample(textCv(CONFIG.greeting,"Georgia,serif",["#ffd36b","#fff","#9be7ff"]),Math.min(visW*.92,9)/900,0,0))}
 else if(i==3){K=.05;D=.87;fillList(sample(envelope(),Math.min(visW*.6,4.2)/400,0,0));letterOn=false;$("skip").style.display="block"}
 else{K=.035;D=.9;genTree();placePhotos();$("skip").style.display="none";$("hint").style.display="block"}}
async function startLetter(){const tok=++LT,box=$("lt");$("letter").style.display="block";box.innerHTML="";
 for(const line of CONFIG.letter){const p=document.createElement("p");box.appendChild(p);for(const ch of line){if(tok!==LT)return;p.textContent+=ch;await wait(34)}await wait(380)}
 await wait(2600);if(tok===LT)goTree()}
function goTree(){LT++;$("letter").style.display="none";enter(4)}
$("skip").onclick=e=>{e.stopPropagation();if(scene<4)goTree()};

// nhạc Jingle Bells bằng WebAudio
let AC,musicOn=false,mi=0,mt;const NF={C:523.25,D:587.33,E:659.25,F:698.46,G:783.99};
const mel="E1 E1 E2 E1 E1 E2 E1 G1 C1.5 D.5 E4 F1 F1 F1.5 F.5 F1 E1 E1 E.5 E.5 E1 D1 D1 E1 D2 G2".split(" ");
function tick(){if(!musicOn)return;const m=mel[mi++%mel.length].match(/([A-G])([\d.]+)/),f=NF[m[1]],b=+m[2]*.3,t=AC.currentTime;
 [1,2].forEach(k=>{const o=AC.createOscillator(),g=AC.createGain();o.type=k==1?"triangle":"sine";o.frequency.value=f*k;g.gain.setValueAtTime(k==1?.09:.03,t);g.gain.exponentialRampToValueAtTime(.0005,t+b+.6);o.connect(g);g.connect(AC.destination);o.start();o.stop(t+b+.7)});
 mt=setTimeout(tick,b*1000+(mi%mel.length==0?1600:0))}
$("mus").onclick=e=>{e.stopPropagation();musicOn=!musicOn;$("mus").style.opacity=musicOn?1:.5;if(musicOn){AC.resume();tick()}else clearTimeout(mt)};
$("start").onclick=()=>{try{AC=new (window.AudioContext||window.webkitAudioContext)();musicOn=true;tick()}catch(e){}
 $("start").style.display="none";$("mus").style.display="block";S1=Math.min(visW*.38,3.2)/300;SF=[sample(santa(0),S1,0,0),sample(santa(1),S1,0,0)];enter(0)};

// ===== Tương tác =====
let down=false,moved=0,lx=0,ly=0,openT=0;
addEventListener("pointerdown",e=>{down=true;moved=0;lx=e.clientX;ly=e.clientY});
addEventListener("pointermove",e=>{mx=(e.clientX/innerWidth*2-1)*visW/2;my=-(e.clientY/innerHeight*2-1)*visH/2;
 if(down){const dx=e.clientX-lx;moved+=Math.abs(dx)+Math.abs(e.clientY-ly);lx=e.clientX;ly=e.clientY;if(scene==4)world.rotation.y+=dx*.008}});
addEventListener("pointerup",e=>{down=false;if(scene==4&&moved<8&&$("pm").style.display!="flex"&&e.target.id=="c"){
 const rc=new THREE.Raycaster();rc.setFromCamera({x:e.clientX/innerWidth*2-1,y:-(e.clientY/innerHeight*2-1)},cam);const h=rc.intersectObjects(sprites)[0];
 if(h){const p=h.object.userData;$("pi").src=p.url;$("pc").textContent=p.t+" · "+p.d;$("pm").style.display="flex";openT=performance.now()}}});
$("pm").onclick=()=>{if(performance.now()-openT>300)$("pm").style.display="none"};

// ===== Vòng lặp =====
let last=performance.now(),T=0;
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;T+=dt;sceneT+=dt;
 if(scene>=0&&scene<3&&sceneT>DUR[scene])enter(scene+1);
 if(scene==3&&!letterOn&&sceneT>CONFIG.envT){letterOn=true;startLetter()}
 if(scene==0){const fi=((sceneT*6)|0)%2;if(fi!==curFi){curFi=fi;fillList(SF[fi])}
  const half=visW/2+S1*160,u=Math.min(sceneT/DUR[0],1);offX=-half+2*half*u;offY=Math.sin(sceneT*13)*.12}
 for(let i=0;i<N;i++){const j=i*3;let x=pos[j],y=pos[j+1],z=pos[j+2];
  vel[j]+=(tp[j]+offX-x)*K;vel[j+1]+=(tp[j+1]+offY-y)*K;vel[j+2]+=(tp[j+2]-z)*K;
  if(repel){const dx=x-mx,dy=y-my,d2=dx*dx+dy*dy;if(d2<.7){const f=(.7-d2)*.06/(Math.sqrt(d2)+.05);vel[j]+=dx*f;vel[j+1]+=dy*f}}
  vel[j]*=D;vel[j+1]*=D;vel[j+2]*=D;pos[j]=x+vel[j];pos[j+1]=y+vel[j+1];pos[j+2]=z+vel[j+2];
  col[j]+=(tc[j]-col[j])*.07;col[j+1]+=(tc[j+1]-col[j+1])*.07;col[j+2]+=(tc[j+2]-col[j+2])*.07}
 geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
 // tuyết rơi + gió
 [[snowF,.012],[snowN,.03]].forEach(([p,v])=>{const a=p.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=v;a[i]+=Math.sin(T+a[i+1])*.003+mx*.0004;if(a[i+1]<-6){a[i+1]=6;a[i]=(Math.random()-.5)*18}}p.geometry.attributes.position.needsUpdate=true});
 stars.material.opacity=.6+.25*Math.sin(T*2);
 if(scene==4){world.rotation.y+=CONFIG.treeSpin*dt*(down?0:1);
  sprites.forEach((s,k)=>{s.material.opacity+=(1-s.material.opacity)*.04;s.material.rotation=Math.sin(T*1.2+k)*.12})}
 R.render(S,cam);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
