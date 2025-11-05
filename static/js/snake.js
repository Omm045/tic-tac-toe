(function(){
  const cv=document.getElementById('cv'); 
  const ctx=cv.getContext('2d');
  const hud=document.createElement('div'); 
  hud.className='controls'; 
  hud.style.justifyContent='space-between';
  hud.innerHTML = '<span class="badge" id="score">Score: 0</span><span class="badge" id="level">Level: 1</span><button class="btn" id="wrap">Wrap: Off</button>';
  cv.parentNode.insertBefore(hud, cv.nextSibling);

  // Add mobile control buttons
  const mobileControls = document.createElement('div');
  mobileControls.className = 'mobile-controls';
  mobileControls.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    max-width: 200px;
    margin: 20px auto;
    height: 150px;
  `;
  
  const createControlBtn = (text, gridArea, action) => {
    const btn = document.createElement('button');
    btn.className = 'btn mobile-btn';
    btn.textContent = text;
    btn.style.cssText = `
      grid-area: ${gridArea};
      font-size: 18px;
      font-weight: bold;
      padding: 10px;
      border-radius: 8px;
      touch-action: manipulation;
      user-select: none;
    `;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      action();
    });
    btn.addEventListener('click', action);
    return btn;
  };
  
  mobileControls.appendChild(createControlBtn('↑', '1 / 2 / 2 / 3', () => changeDirection('U')));
  mobileControls.appendChild(createControlBtn('←', '2 / 1 / 3 / 2', () => changeDirection('L')));
  mobileControls.appendChild(createControlBtn('↓', '3 / 2 / 4 / 3', () => changeDirection('D')));
  mobileControls.appendChild(createControlBtn('→', '2 / 3 / 3 / 4', () => changeDirection('R')));
  
  const pauseBtn = createControlBtn('⏸', '2 / 2 / 3 / 3', () => {
    playing = !playing;
    pauseBtn.textContent = playing ? '⏸' : '▶';
    if (playing) step();
  });
  mobileControls.appendChild(pauseBtn);
  
  cv.parentNode.insertBefore(mobileControls, hud.nextSibling);

  const N=20, S=cv.width/N; 
  let dir='R', next='R', speed=140, playing=true, wrap=false, score=0, level=1;
  let snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}];
  let food=spawn(); 
  let coin=maybeCoin(); 
  let trail=[];
  
  // Touch/swipe handling
  let touchStartX = 0, touchStartY = 0;
  let touchEndX = 0, touchEndY = 0;
  
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }
  
  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
  }
  
  function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && dir !== 'L') {
          changeDirection('R');
        } else if (deltaX < 0 && dir !== 'R') {
          changeDirection('L');
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && dir !== 'U') {
          changeDirection('D');
        } else if (deltaY < 0 && dir !== 'D') {
          changeDirection('U');
        }
      }
    }
  }
  
  function changeDirection(newDir) {
    // Prevent immediate reverse direction
    if ((newDir === 'L' && dir !== 'R') ||
        (newDir === 'R' && dir !== 'L') ||
        (newDir === 'U' && dir !== 'D') ||
        (newDir === 'D' && dir !== 'U')) {
      next = newDir;
    }
  }
  
  // Add touch event listeners to canvas
  cv.addEventListener('touchstart', handleTouchStart, {passive: false});
  cv.addEventListener('touchend', handleTouchEnd, {passive: false});
  
  // Prevent scrolling on canvas touch
  cv.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});

  function rng(n){ return Math.floor(Math.random()*n); }
  function spawn(){ return placeAwayFromSnake(); }
  function placeAwayFromSnake(){ 
    let p; 
    do{ p={x:rng(N), y:rng(N)} } while(snake.some(s=>s.x===p.x&&s.y===p.y)); 
    return p; 
  }
  function maybeCoin(){ return Math.random()<0.25? placeAwayFromSnake(): null; }

  function draw(){
    // fade trail
    ctx.fillStyle='rgba(15,18,25,0.6)'; 
    ctx.fillRect(0,0,cv.width,cv.height);
    
    // grid subtle
    ctx.strokeStyle='#141826'; 
    ctx.lineWidth=1; 
    for(let i=1;i<N;i++){ 
      ctx.beginPath(); 
      ctx.moveTo(i*S,0); 
      ctx.lineTo(i*S,cv.height); 
      ctx.stroke(); 
      ctx.beginPath(); 
      ctx.moveTo(0,i*S); 
      ctx.lineTo(cv.width,i*S); 
      ctx.stroke(); 
    }
    
    // snake
    ctx.fillStyle='#2bd4ff'; 
    snake.forEach((p,i)=>{ 
      const k=i===0?2:4; 
      ctx.fillRect(p.x*S+k,p.y*S+k,S-2*k,S-2*k); 
    });
    
    // food
    ctx.fillStyle='#a0e7e5'; 
    ctx.fillRect(food.x*S+4,food.y*S+4,S-8,S-8);
    
    // coin
    if(coin){ 
      ctx.fillStyle='#ffd166'; 
      ctx.beginPath(); 
      ctx.arc(coin.x*S+S/2, coin.y*S+S/2, S*0.25, 0, Math.PI*2); 
      ctx.fill(); 
    }
  }

  function step(){ 
    if(!playing) return; 
    dir=next; 
    const head={...snake[0]}; 
    
    if(dir==='L')head.x--; 
    if(dir==='R')head.x++; 
    if(dir==='U')head.y--; 
    if(dir==='D')head.y++; 
    
    if(wrap){ 
      if(head.x<0) head.x=N-1; 
      if(head.y<0) head.y=N-1; 
      if(head.x>=N) head.x=0; 
      if(head.y>=N) head.y=0; 
    }
    
    if(!wrap && (head.x<0||head.y<0||head.x>=N||head.y>=N)) { 
      gameOver(); 
      return; 
    }
    
    if(snake.some(p=>p.x===head.x&&p.y===head.y)){ 
      gameOver(); 
      return; 
    }
    
    snake.unshift(head);
    
    if(head.x===food.x&&head.y===food.y){
      score+=10; 
      updateHud(); 
      food=spawn(); 
      if(speed>70) speed-=4; 
      if(score%50===0){ 
        level++; 
        updateHud(); 
      }
    } else if(coin && head.x===coin.x && head.y===coin.y){
      score+=25; 
      updateHud(); 
      coin=null; 
      setTimeout(()=>{ coin=maybeCoin(); }, 3000);
    } else {
      snake.pop();
    }
    
    draw(); 
    setTimeout(step,speed);
  }

  function updateHud(){ 
    document.getElementById('score').textContent='Score: '+score; 
    document.getElementById('level').textContent='Level: '+level; 
  }
  
  function gameOver(){ 
    playing=false; 
    pauseBtn.textContent = '▶';
    
    const bar=document.createElement('div'); 
    bar.className='controls'; 
    const btn=document.createElement('button'); 
    btn.className='btn'; 
    btn.textContent='Restart'; 
    btn.onclick=()=>{ 
      score=0; 
      level=1; 
      speed=140; 
      dir=next='R'; 
      snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}]; 
      food=spawn(); 
      coin=maybeCoin(); 
      playing=true; 
      pauseBtn.textContent = '⏸';
      updateHud(); 
      draw(); 
      step(); 
      bar.remove(); 
    }; 
    bar.appendChild(btn); 
    cv.parentNode.insertBefore(bar, hud.nextSibling); 
  }

  document.getElementById('wrap').onclick=()=>{ 
    wrap=!wrap; 
    document.getElementById('wrap').textContent='Wrap: '+(wrap?'On':'Off'); 
  };
  
  // Keyboard controls (desktop)
  addEventListener('keydown',e=>{ 
    if(e.key==='ArrowLeft') changeDirection('L');
    if(e.key==='ArrowRight') changeDirection('R');
    if(e.key==='ArrowUp') changeDirection('U');
    if(e.key==='ArrowDown') changeDirection('D');
    if(e.key.toLowerCase()==='p') {
      playing=!playing;
      pauseBtn.textContent = playing ? '⏸' : '▶';
      playing&&step();
    }
  });

  // initial
  ctx.fillStyle='#0f1219'; 
  ctx.fillRect(0,0,cv.width,cv.height); 
  updateHud(); 
  draw(); 
  step();
})();