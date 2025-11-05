// Audio bootstrap & robust ENABLE logic
(function(){
  const toast = document.getElementById('audio-toast');
  const enableBtn = document.getElementById('enable-audio-btn');
  const bg = document.getElementById('background-music');
  const move = document.getElementById('move-sound');
  const win = document.getElementById('win-sound');
  const click = document.getElementById('click-sound');

  function hideToast() { toast && toast.classList.add('hidden'); }
  function showToast() { toast && toast.classList.remove('hidden'); }

  function tryPlay(el) { return el && el.play ? el.play().catch(()=>Promise.reject()) : Promise.reject(); }

  function startAll() {
    Promise.resolve()
      .then(()=> tryPlay(bg))
      .then(()=> { hideToast(); })
      .catch(()=> { showToast(); });
  }

  // Preload and wire gesture triggers
  [bg, move, win, click].forEach(a=>{ if(a){ a.preload='auto'; a.load?.(); }});
  document.addEventListener('pointerdown', startAll, { once:true });
  document.addEventListener('keydown', startAll, { once:true });
  enableBtn && enableBtn.addEventListener('click', ()=>{
    tryPlay(bg).then(()=>{ hideToast(); }).catch(()=>{ showToast(); });
  });
})();