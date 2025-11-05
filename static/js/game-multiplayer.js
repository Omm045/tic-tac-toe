async createRoomAndCopyLink() {
        try {
            this.isHost = true;
            this.mySymbol = 'X';
            
            const maker = window.createTicTacToePeer || (()=>new window.Peer());
            this.peer = maker();
            
            // Disable the button while creating
            this.createRoomBtn.disabled = true;
            this.createRoomBtn.textContent = 'CREATING...';

            this.peer.on('open', (id) => {
                const url = location.origin + location.pathname + '?code=' + encodeURIComponent(id);
                navigator.clipboard.writeText(url).then(() => {
                    this.createRoomBtn.textContent = 'LINK COPIED!';
                    setTimeout(() => {
                        this.createRoomBtn.textContent = 'CREATE ROOM & COPY LINK';
                        this.createRoomBtn.disabled = false;
                    }, 1600);
                }).catch(() => {
                    // Fallback for older browsers
                    const input = document.createElement('input');
                    input.value = url;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    this.createRoomBtn.textContent = 'LINK COPIED!';
                    setTimeout(() => {
                        this.createRoomBtn.textContent = 'CREATE ROOM & COPY LINK';
                        this.createRoomBtn.disabled = false;
                    }, 1600);
                });
                
                history.replaceState(null, '', '?code=' + encodeURIComponent(id));
                this.showStatus('Room created! Share the copied link.', 'success');
            });
            
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.createRoomBtn.textContent = 'CREATE ROOM & COPY LINK';
                this.createRoomBtn.disabled = false;
                this.showStatus('Could not create room. Try again.', 'error');
            });
            
            this.peer.on('connection', (conn) => {
                this.bindConnection(conn);
            });
            
        } catch (error) {
            console.error('Error creating room:', error);
            this.createRoomBtn.textContent = 'CREATE ROOM & COPY LINK';
            this.createRoomBtn.disabled = false;
            this.showStatus('Failed to create room', 'error');
        }
    }