// Multiplayer badge overlays & smarter share implementation
(function(){
  // Add badge overlays to video containers
  function updateBadges(audioMuted, videoMuted) {
    let localVideoLabel = document.querySelector('#local-video + .video-label');
    let remoteVideoLabel = document.querySelector('#remote-video + .video-label');
    // Remove any old badge
    document.querySelectorAll('.muted-badge, .audio-mute-badge').forEach(l=>l.remove());
    if(videoMuted) {
      let badge = document.createElement('div');
      badge.className = 'video-label muted-badge';
      badge.textContent = 'VIDEO OFF';
      localVideoLabel.parentNode.appendChild(badge);
    }
    if(audioMuted) {
      let badge = document.createElement('div');
      badge.className = 'video-label audio-mute-badge';
      badge.textContent = 'MIC OFF';
      localVideoLabel.parentNode.appendChild(badge);
    }
  }

  window.updateVideoMuteBadges = updateBadges;

  // Share/Copy: Room Code & Link
  function setupShare(roomId) {
    var copyIcon = document.createElement('svg');
    copyIcon.innerHTML = '<title>Copy</title><rect x="5" y="5" width="12" height="12"/><rect x="10" y="2" width="9" height="9" fill="none" stroke="currentColor"/>';
    copyIcon.classList.add('copy-icon');
    var codeInput = document.getElementById('room-id-display');
    if(codeInput && codeInput.parentNode) {
      codeInput.parentNode.appendChild(copyIcon);
      copyIcon.onclick = () => {
        codeInput.select();
        document.execCommand('copy');
      };
    }
    var shareLink = document.getElementById('share-link');
    if(shareLink) {
      shareLink.onclick = function() {
        var url = window.location.origin + '?code=' + encodeURIComponent(roomId);
        if(navigator.share) {
          navigator.share({ title: 'Join my Tic Tac Toe game!', url });
        } else {
          navigator.clipboard.writeText(url);
          shareLink.textContent = 'Copied!';
          setTimeout(()=>{shareLink.textContent='Copy join link';},2000);
        }
      };
    }
  }
  window.setupMultiplayerShareUI = setupShare;
})();