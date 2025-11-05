// Force ICE servers (STUN + TURN) and robust PeerJS lifecycle logging
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
          { urls: [ 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302' ] },
          { urls: [ 'turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turns:openrelay.metered.ca:443' ], username: 'openrelayproject', credential: 'openrelayproject' }
        ],
        iceTransportPolicy: 'all',
        iceCandidatePoolSize: 16
      }
    });

    peer.on('open', id => console.log('[Peer] open', id));
    peer.on('connection', () => console.log('[Peer] data connection incoming'));
    peer.on('call', () => console.log('[Peer] media call incoming'));
    peer.on('disconnected', ()=>console.warn('[Peer] disconnected'));
    peer.on('close', ()=>console.warn('[Peer] closed'));
    peer.on('error', (e)=>console.error('[Peer] error', e));
    return peer;
  };
})();