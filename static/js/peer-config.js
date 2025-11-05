// Force ICE servers and robust PeerJS lifecycle logging
(function(){
  const OriginalPeer = window.Peer;
  if (!OriginalPeer) return;
  window.createTicTacToePeer = function()
  {
    const peer = new OriginalPeer(undefined, {
      host: 'peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      debug: 2,
      config: {
        iceServers: [
          { urls: [ 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302' ] }
        ],
        iceCandidatePoolSize: 8
      }
    });

    peer.on('disconnected', ()=>console.warn('[Peer] disconnected'));
    peer.on('close', ()=>console.warn('[Peer] closed'));
    peer.on('error', (e)=>console.error('[Peer] error', e));
    return peer;
  };
})();