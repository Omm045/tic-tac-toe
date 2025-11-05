// Use full PeerJS Cloud; show full room id as code; read ?code= on load
(function(){
  const $ = (s)=>document.querySelector(s);
  const joinInput = $('#room-id-input');
  const hostSection = $('#host-section');
  const joinSection = $('#join-section');
  const modeHostBtn = $('#host-btn');
  const modeJoinBtn = $('#join-btn');
  const codeDisplay = $('#room-id-display');
  const copyBtn = $('#copy-id-btn');
  const shareLink = $('#share-link');

  // Prefill from URL
  const params = new URLSearchParams(location.search);
  const urlCode = params.get('code');
  if (urlCode && joinInput) {
    joinSection?.classList.remove('hidden');
    hostSection?.classList.add('hidden');
    modeJoinBtn?.classList.add('active');
    modeHostBtn?.classList.remove('active');
    joinInput.value = urlCode;
  }

  // Wire copy & share for full ID
  function wireSharing(roomId){
    if(codeDisplay) codeDisplay.value = roomId;
    if(copyBtn){
      copyBtn.onclick = ()=>{
        codeDisplay.select(); document.execCommand('copy');
        copyBtn.textContent = 'COPIED'; setTimeout(()=>copyBtn.textContent='COPY',1500);
      };
    }
    if(shareLink){
      shareLink.onclick = ()=>{
        const url = location.origin + location.pathname + '?code=' + encodeURIComponent(roomId);
        if(navigator.share){ navigator.share({ title:'Join my Tic Tac Toe game!', url }); }
        else { navigator.clipboard.writeText(url); shareLink.textContent='Copied!'; setTimeout(()=>shareLink.textContent='Copy join link',1500); }
      };
    }
    history.replaceState(null,'','?code='+encodeURIComponent(roomId));
  }
  window.__wireRoomSharing = wireSharing;
})();