(function(){
  const cv=document.getElementById('cv'); const ctx=cv.getContext('2d');
  const hud=document.createElement('div'); hud.className='controls'; hud.style.justifyContent='space-between';
  hud.innerHTML = '<span class="badge" id="score">Score: 0</span><span class="badge" id="level">Level: 1</span><button class="btn" id="wrap">Wrap: Off</button>';
  cv.parentNode.insertBefore(hud, cv.nextSibling);

  const N=20, S=cv.width/N; let dir='R', next='R', speed=140, playing=true, wrap=false, score=0, level=1;
  let snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}];
  let food=spawn(); let coin=maybeCoin(); let trail=[];

  function rng(n){ return Math.floor(Math.random()*n); }
  function spawn(){ return placeAwayFromSnake(); }
  function placeAwayFromSnake(){ let p; do{ p={x:rng(N), y:rng(N)} } while(snake.some(s=>s.x===p.x&&s.y===p.y)); return p; }
  function maybeCoin(){ return Math.random()<0.25? placeAwayFromSnake(): null; }

  function draw(){
    // fade trail
    ctx.fillStyle='rgba(15,18,25,0.6)'; ctx.fillRect(0,0,cv.width,cv.height);
    // grid subtle
    ctx.strokeStyle='#141826'; ctx.lineWidth=1; for(let i=1;i<N;i++){ ctx.beginPath(); ctx.moveTo(i*S,0); ctx.lineTo(i*S,cv.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*S); ctx.lineTo(cv.width,i*S); ctx.stroke(); }
    // snake
    ctx.fillStyle='#2bd4ff'; snake.forEach((p,i)=>{ const k=i===0?2:4; ctx.fillRect(p.x*S+k,p.y*S+k,S-2*k,S-2*k); });
    // food
    ctx.fillStyle='#a0e7e5'; ctx.fillRect(food.x*S+4,food.y*S+4,S-8,S-8);
    // coin
    if(coin){ ctx.fillStyle='#ffd166'; ctx.beginPath(); ctx.arc(coin.x*S+S/2, coin.y*S+S/2, S*0.25, 0, Math.PI*2); ctx.fill(); }
  }

  function step(){ if(!playing) return; dir=next; const head={...snake[0]}; if(dir==='L')head.x--; if(dir==='R')head.x++; if(dir==='U')head.y--; if(dir==='D')head.y++; if(wrap){ if(head.x<0) head.x=N-1; if(head.y<0) head.y=N-1; if(head.x>=N) head.x=0; if(head.y>=N) head.y=0; }
    if(!wrap && (head.x<0||head.y<0||head.x>=N||head.y>=N)) { gameOver(); return; }
    if(snake.some(p=>p.x===head.x&&p.y===head.y)){ gameOver(); return; }
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){
      score+=10; updateHud(); food=spawn(); if(speed>70) speed-=4; if(score%50===0){ level++; updateHud(); }
    } else if(coin && head.x===coin.x && head.y===coin.y){
      score+=25; updateHud(); coin=null; setTimeout(()=>{ coin=maybeCoin(); }, 3000);
    } else {
      snake.pop();
    }
    draw(); setTimeout(step,speed);
  }

  function updateHud(){ document.getElementById('score').textContent='Score: '+score; document.getElementById('level').textContent='Level: '+level; }
  function gameOver(){ playing=false; const bar=document.createElement('div'); bar.className='controls'; const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Restart'; btn.onclick=()=>{ score=0; level=1; speed=140; dir=next='R'; snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}]; food=spawn(); coin=maybeCoin(); playing=true; updateHud(); draw(); step(); bar.remove(); }; bar.appendChild(btn); cv.parentNode.insertBefore(bar, hud.nextSibling); }

  document.getElementById('wrap').onclick=()=>{ wrap=!wrap; document.getElementById('wrap').textContent='Wrap: '+(wrap?'On':'Off'); };
  addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'&&dir!=='R')next='L'; if(e.key==='ArrowRight'&&dir!=='L')next='R'; if(e.key==='ArrowUp'&&dir!=='D')next='U'; if(e.key==='ArrowDown'&&dir!=='U')next='D'; if(e.key.toLowerCase()==='p') playing=!playing, playing&&step(); });

  // initial
  ctx.fillStyle='#0f1219'; ctx.fillRect(0,0,cv.width,cv.height); updateHud(); draw(); step();
})();