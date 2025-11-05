// Auto-join by URL code and connection status banner
(function(){
  const $ = (s)=>document.querySelector(s);
  const statusBar = document.createElement('div');
  statusBar.id = 'rtc-status';
  statusBar.style.cssText = 'position:fixed;bottom:10px;left:50%;transform:translateX(-50%);padding:6px 12px;border-radius:12px;background:rgba(0,0,0,.6);border:1px solid rgba(0,255,255,.3);color:#0ff;font-family:Orbitron,monospace;font-size:12px;z-index:9999;';
  document.body.appendChild(statusBar);
  function setStatus(t){ statusBar.textContent = t; }

  // Monkey-patch Peer to use our factory if present
  const makePeer = window.createTicTacToePeer || (function(){ return new window.Peer(undefined,{host:'peerjs.com',port:443,secure:true,path:'/',debug:2}); });

  // Hook into host/join buttons to add status
  const hostBtn = $('#host-btn');
  const joinBtn = $('#join-btn');
  const connectBtn = $('#connect-btn');
  const joinInput = $('#room-id-input');

  // Auto-join if ?code= present
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  if (code && joinBtn) {
    setStatus('Join link detected. Preparing camera/mic...');
    joinBtn.click();
    joinInput.value = code;
    // Defer CONNECT to allow UI/render and permission prompt
    setTimeout(()=>{
      setStatus('Requesting permissions...');
      connectBtn.click();
    }, 600);
  }

  // Surface data channel state through UI
  const origSetupData = window.TicTacToeSetupDataChannel;
})();