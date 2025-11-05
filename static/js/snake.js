(function(){
  const cv=document.getElementById('cv'); const ctx=cv.getContext('2d');
  const N=18, S=cv.width/N; let dir='R', next='R', food=spawn(), speed=120, playing=true;
  let snake=[{x:5,y:9},{x:4,y:9},{x:3,y:9}];
  function spawn(){ return {x:Math.floor(Math.random()*N), y:Math.floor(Math.random()*N)} }
  function draw(){ ctx.fillStyle='#0f1219'; ctx.fillRect(0,0,cv.width,cv.height); ctx.fillStyle='#2bd4ff'; snake.forEach(p=>ctx.fillRect(p.x*S+2,p.y*S+2,S-4,S-4)); ctx.fillStyle='#a0e7e5'; ctx.fillRect(food.x*S+4,food.y*S+4,S-8,S-8); }
  function step(){ if(!playing) return; dir=next; const head={...snake[0]}; if(dir==='L')head.x--; if(dir==='R')head.x++; if(dir==='U')head.y--; if(dir==='D')head.y++; if(head.x<0||head.y<0||head.x>=N||head.y>=N||snake.some(p=>p.x===head.x&&p.y===head.y)){ playing=false; return; } snake.unshift(head); if(head.x===food.x&&head.y===food.y){ food=spawn(); if(speed>60) speed-=5; } else snake.pop(); draw(); setTimeout(step,speed); }
  addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'&&dir!=='R')next='L'; if(e.key==='ArrowRight'&&dir!=='L')next='R'; if(e.key==='ArrowUp'&&dir!=='D')next='U'; if(e.key==='ArrowDown'&&dir!=='U')next='D'; if(e.key.toLowerCase()==='p') playing=!playing, playing&&step(); });
  draw(); step();
})();