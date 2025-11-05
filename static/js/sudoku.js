(function(){
  const grid=document.getElementById('grid'); const genBtn=document.getElementById('gen'); const solveBtn=document.getElementById('solve');
  let cells=[]; function build(){ grid.innerHTML=''; cells=[]; for(let i=0;i<81;i++){ const inp=document.createElement('input'); inp.className='sudoku'; inp.maxLength=1; inp.inputMode='numeric'; grid.appendChild(inp); cells.push(inp); } }
  function getBoard(){ return cells.map(i=>parseInt(i.value)||0); }
  function setBoard(b){ b.forEach((v,i)=> cells[i].value= v?String(v):''); }
  function isSafe(b,r,c,n){ for(let i=0;i<9;i++){ if(b[r*9+i]===n||b[i*9+c]===n) return false; } const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3; for(let rr=0;rr<3;rr++) for(let cc=0;cc<3;cc++) if(b[(br+rr)*9+(bc+cc)]===n) return false; return true; }
  function solve(b){ for(let i=0;i<81;i++){ if(!b[i]){ const r=Math.floor(i/9), c=i%9; for(let n=1;n<=9;n++){ if(isSafe(b,r,c,n)){ b[i]=n; if(solve(b)) return true; b[i]=0; } } return false; } } return true; }
  function generate(){ // simple generator: fill diagonal boxes then solve and remove
    let b=Array(81).fill(0);
    function fillBox(sr,sc){ const nums=[1,2,3,4,5,6,7,8,9]; for(let i=0;i<9;i++){ const r=sr+Math.floor(i/3), c=sc+(i%3); const pick=nums.splice(Math.floor(Math.random()*nums.length),1)[0]; b[r*9+c]=pick; } }
    fillBox(0,0); fillBox(3,3); fillBox(6,6); solve(b);
    // remove entries based on difficulty
    let remove=45; while(remove>0){ const idx=Math.floor(Math.random()*81); if(b[idx]!==0){ b[idx]=0; remove--; } }
    return b;
  }
  genBtn.onclick=()=> setBoard(generate());
  solveBtn.onclick=()=>{ const b=getBoard(); solve(b); setBoard(b); };
  build(); setBoard(generate());
})();