// Minimal Tic Tac Toe with modes: local, bot-easy, bot-hard
(function(){
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const modeSel = document.getElementById('mode');
  const modeBadge = document.getElementById('mode-badge');
  const newBtn = document.getElementById('new');

  let mode = 'local';
  let board = Array(9).fill('');
  let cur = 'X';
  let over = false;

  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = (b)=>{ for(const w of wins){ const [a,c,d]=w; if(b[a] && b[a]===b[c] && b[c]===b[d]) return b[a]; } return b.every(v=>v)?'draw':null; };

  function render(){
    modeBadge.textContent = 'Mode: ' + (mode==='local'?'Local':mode==='bot-easy'?'Bot Easy':'Bot Hard');
    statusEl.textContent = over? (winner(board)==='draw'?'Draw':`Winner ${winner(board)}`) : `Player ${cur} turn`;
    boardEl.innerHTML=''; boardEl.className='board grid-3';
    board.forEach((v,i)=>{
      const c=document.createElement('div'); c.className='cell'; c.style.aspectRatio='1/1'; c.textContent=v; c.onclick=()=>move(i);
      boardEl.appendChild(c);
    });
  }

  function move(i){ if(over||board[i])return; board[i]=cur; const w=winner(board); if(w){ over=true; render(); return;} cur = cur==='X'?'O':'X'; render(); if((mode==='bot-easy'||mode==='bot-hard') && cur==='O') ai(); }

  function ai(){ setTimeout(()=>{ const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);
    if(mode==='bot-easy'){ const pick = empty[Math.floor(Math.random()*empty.length)]; move(pick); return; }
    // hard: minimax
    let best=-1e9, bestMove=null;
    for(const i of empty){ board[i]='O'; const score=minimax(board,false); board[i]=''; if(score>best){ best=score; bestMove=i; } }
    move(bestMove);
  }, 160); }

  function minimax(b, isMax){ const w=winner(b); if(w==='O') return 10; if(w==='X') return -10; if(w==='draw') return 0; const empty=b.map((v,i)=>v?null:i).filter(v=>v!==null); let best=isMax?-1e9:1e9; for(const i of empty){ b[i]= isMax?'O':'X'; const val=minimax(b,!isMax); b[i]=''; best= isMax? Math.max(best,val): Math.min(best,val); } return best; }

  function reset(){ board=Array(9).fill(''); cur='X'; over=false; render(); }

  modeSel.onchange=()=>{ mode=modeSel.value; reset(); };
  newBtn.onclick=reset;
  render();
})();