class TicTacToeMultiplayer {
    constructor() {
        this.gameState = {
            board: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X',
            gameOver: false,
            winner: null,
            winningLine: null,
            scores: { X: 0, O: 0, draws: 0 }
        };
        this.isGameActive = true;
        this.soundEnabled = false; // disable all sounds
        
        // Multiplayer properties
        this.isMultiplayer = false;
        this.isHost = false;
        this.mySymbol = 'X';
        this.peer = null;
        this.connection = null;
        this.call = null;
        this.localStream = null;
        this.remoteStream = null;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        
        this.loadScores();
        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
    }
    
    initializeElements() {
        // Game elements
        this.gameBoard = document.getElementById('game-board');
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerDisplay = document.getElementById('current-player-display');
        this.restartBtn = document.getElementById('restart-btn');
        this.resetScoresBtn = document.getElementById('reset-scores-btn');
        this.gameStatus = document.getElementById('game-status');
        this.victoryOverlay = document.getElementById('victory-overlay');
        this.victoryText = document.getElementById('victory-text');
        this.scoreX = document.getElementById('score-x');
        this.scoreO = document.getElementById('score-o');
        this.scoreDraws = document.getElementById('score-draws');
        this.gameModeIndicator = document.getElementById('game-mode');
        
        // Multiplayer elements
        this.multiplayerPanel = document.getElementById('multiplayer-panel');
        this.toggleMultiplayerBtn = document.getElementById('toggle-multiplayer');
        this.multiplayerContent = document.getElementById('multiplayer-content');
        this.hostBtn = document.getElementById('host-btn');
        this.joinBtn = document.getElementById('join-btn');
        this.hostSection = document.getElementById('host-section');
        this.joinSection = document.getElementById('join-section');
        this.roomIdDisplay = document.getElementById('room-id-display');
        this.copyIdBtn = document.getElementById('copy-id-btn');
        this.roomIdInput = document.getElementById('room-id-input');
        this.connectBtn = document.getElementById('connect-btn');
        this.localVideo = document.getElementById('local-video');
        this.remoteVideo = document.getElementById('remote-video');
        this.toggleVideoBtn = document.getElementById('toggle-video');
        this.toggleAudioBtn = document.getElementById('toggle-audio');
        this.disconnectBtn = document.getElementById('disconnect-btn');
    }
    
    setupEventListeners() {
        // Game events
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
        this.victoryOverlay.addEventListener('click', () => this.hideVictoryOverlay());
        
        // Multiplayer events
        this.toggleMultiplayerBtn.addEventListener('click', () => this.toggleMultiplayerPanel());
        this.hostBtn.addEventListener('click', () => this.hostGame());
        this.joinBtn.addEventListener('click', () => this.showJoinSection());
        this.copyIdBtn.addEventListener('click', () => this.copyRoomId());
        this.connectBtn.addEventListener('click', () => this.joinGame());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.restartGame();
            }
            if (e.key === 'Escape') {
                this.hideVictoryOverlay();
            }
            if (e.key >= '1' && e.key <= '9') {
                const position = parseInt(e.key) - 1;
                const cell = document.querySelector(`[data-index="${position}"]`);
                if (cell) {
                    cell.click();
                }
            }
        });
    }
    
    // Multiplayer Methods
    toggleMultiplayerPanel() {
        this.multiplayerContent.classList.toggle('hidden');
    }
    
    async hostGame() {
        try {
            this.isHost = true;
            this.mySymbol = 'X';
            
            // Initialize PeerJS with cloud defaults (reliable)
            this.peer = new Peer(undefined, {
                host: 'peerjs.com',
                port: 443,
                path: '/',
                secure: true,
                debug: 2
            });
            
            this.peer.on('open', (id) => {
                this.roomIdDisplay.value = id;
                history.replaceState(null, '', '?code=' + encodeURIComponent(id));
                this.hostSection.classList.remove('hidden');
                this.joinSection.classList.add('hidden');
                this.hostBtn.classList.add('active');
                this.joinBtn.classList.remove('active');
            });
            
            this.peer.on('connection', (conn) => {
                this.connection = conn;
                this.setupDataConnection();
                this.showStatus('Player connected!', 'success');
                this.isMultiplayer = true;
                this.gameModeIndicator.textContent = 'MULTIPLAYER - HOST';
            });
            
            this.peer.on('call', (call) => {
                this.handleIncomingCall(call);
            });
            
            await this.startLocalVideo();
            
        } catch (error) {
            console.error('Error hosting game:', error);
            this.showStatus('Failed to host game', 'error');
        }
    }
    
    showJoinSection() {
        this.hostSection.classList.add('hidden');
        this.joinSection.classList.remove('hidden');
        this.hostBtn.classList.remove('active');
        this.joinBtn.classList.add('active');
        
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (code) {
            this.roomIdInput.value = code;
        }
    }
    
    async joinGame() {
        const roomId = this.roomIdInput.value.trim();
        if (!roomId) {
            this.showStatus('Please enter a Room ID', 'error');
            return;
        }
        
        try {
            this.isHost = false;
            this.mySymbol = 'O';
            
            this.peer = new Peer(undefined, {
                host: 'peerjs.com',
                port: 443,
                path: '/',
                secure: true,
                debug: 2
            });
            
            this.peer.on('open', async () => {
                this.connection = this.peer.connect(roomId);
                this.setupDataConnection();
                
                await this.startLocalVideo();
                this.call = this.peer.call(roomId, this.localStream);
                this.setupMediaConnection(this.call);
                
                this.isMultiplayer = true;
                this.gameModeIndicator.textContent = 'MULTIPLAYER - GUEST';
                this.showStatus('Connected to host!', 'success');
            });
            
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.showStatus('Connection error. Check Room ID and try again.', 'error');
            });
            
        } catch (error) {
            console.error('Error joining game:', error);
            this.showStatus('Failed to join game', 'error');
        }
    }
    
    async startLocalVideo() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            this.localVideo.srcObject = this.localStream;
        } catch (error) {
            console.error('Error accessing camera/microphone:', error);
            this.showStatus('Camera/microphone access denied', 'error');
        }
    }
    
    async handleIncomingCall(call) {
        if (!this.localStream) await this.startLocalVideo();
        call.answer(this.localStream);
        this.call = call;
        this.setupMediaConnection(call);
    }
    
    setupMediaConnection(call) {
        call.on('stream', (remoteStream) => {
            this.remoteStream = remoteStream;
            this.remoteVideo.srcObject = remoteStream;
        });
        call.on('close', () => {
            this.remoteVideo.srcObject = null;
            this.remoteStream = null;
        });
    }
    
    setupDataConnection() {
        this.connection.on('data', (data) => this.handleRemoteMove(data));
        this.connection.on('open', () => this.showStatus('Data channel open', 'success'));
        this.connection.on('close', () => this.disconnect());
        this.connection.on('error', () => this.showStatus('Data channel error', 'error'));
    }
    
    sendMove(position) {
        if (this.connection && this.connection.open) {
            this.connection.send({ type: 'move', position, player: this.mySymbol });
        }
    }
    
    handleRemoteMove(data) {
        if (data.type !== 'move') return;
        this.gameState.board[data.position] = data.player;
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
        const result = this.checkWinner(this.gameState.board);
        if (result.winner) {
            this.gameState.gameOver = true;
            this.gameState.winner = result.winner;
            this.gameState.winningLine = result.line;
            if (result.winner === 'draw') this.gameState.scores.draws++; else this.gameState.scores[result.winner]++;
            this.saveScores();
            this.handleGameEnd();
        }
        this.updateUI();
    }
    
    copyRoomId() {
        this.roomIdDisplay.select();
        document.execCommand('copy');
        this.showStatus('Room ID copied!', 'success');
    }
    
    toggleVideo() {
        if (!this.localStream) return;
        this.isVideoEnabled = !this.isVideoEnabled;
        this.localStream.getVideoTracks().forEach(t => t.enabled = this.isVideoEnabled);
        this.toggleVideoBtn.classList.toggle('muted', !this.isVideoEnabled);
    }
    
    toggleAudio() {
        if (!this.localStream) return;
        this.isAudioEnabled = !this.isAudioEnabled;
        this.localStream.getAudioTracks().forEach(t => t.enabled = this.isAudioEnabled);
        this.toggleAudioBtn.classList.toggle('muted', !this.isAudioEnabled);
    }
    
    disconnect() {
        try { this.connection?.close(); } catch {}
        try { this.call?.close(); } catch {}
        try { this.peer?.destroy(); } catch {}
        try { this.localStream?.getTracks().forEach(t=>t.stop()); } catch {}
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        this.isMultiplayer = false;
        this.gameModeIndicator.textContent = 'LOCAL GAME';
        this.hostSection.classList.add('hidden');
        this.joinSection.classList.add('hidden');
        this.hostBtn.classList.remove('active');
        this.joinBtn.classList.remove('active');
        this.showStatus('Disconnected from multiplayer', 'info');
        this.restartGame();
    }
    
    // Game Logic Methods
    checkWinner(board) {
        const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let c of w) if (board[c[0]] && board[c[0]]===board[c[1]] && board[c[1]]===board[c[2]]) return { winner: board[c[0]], line: c };
        if (!board.includes('')) return { winner: 'draw', line: null };
        return { winner: null, line: null };
    }
    
    handleCellClick(event) {
        const cell = event.target; const position = parseInt(cell.dataset.index);
        if (!this.isGameActive || this.gameState.gameOver || this.gameState.board[position] !== '') return;
        if (this.isMultiplayer && this.gameState.currentPlayer !== this.mySymbol) { this.showStatus('Wait for your turn!', 'error'); return; }
        this.gameState.board[position] = this.gameState.currentPlayer;
        if (this.isMultiplayer) this.sendMove(position);
        const result = this.checkWinner(this.gameState.board);
        if (result.winner) { this.gameState.gameOver = true; this.gameState.winner = result.winner; this.gameState.winningLine = result.line; if (result.winner==='draw') this.gameState.scores.draws++; else this.gameState.scores[result.winner]++; this.saveScores(); this.handleGameEnd(); }
        else { this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X'; }
        this.updateUI();
    }
    
    animateMove(cell) {
        cell.style.transform = 'scale(0.8)'; cell.style.opacity = '0.5'; setTimeout(()=>{ cell.style.transform = 'scale(1.1)'; cell.style.opacity = '1'; setTimeout(()=>{ cell.style.transform = 'scale(1)'; },100); },50);
    }
    
    restartGame() {
        this.gameState = { board: Array(9).fill(''), currentPlayer: 'X', gameOver: false, winner: null, winningLine: null, scores: this.gameState.scores };
        this.isGameActive = true; this.hideVictoryOverlay(); this.updateUI(); this.showStatus('New game started!', 'success');
    }
    
    resetScores() { this.gameState.scores = { X:0, O:0, draws:0 }; this.saveScores(); this.updateUI(); this.showStatus('Scores reset!', 'success'); }
    saveScores() { try { localStorage.setItem('ticTacToeScores', JSON.stringify(this.gameState.scores)); } catch {} }
    loadScores() { try { const s = localStorage.getItem('ticTacToeScores'); if (s) this.gameState.scores = JSON.parse(s); } catch {} }
    
    updateUI() {
        this.cells.forEach((cell,i)=>{ const v=this.gameState.board[i]; if(cell.textContent!==v){ cell.textContent=v; cell.className='cell'; if(v==='X') cell.classList.add('x'); if(v==='O') cell.classList.add('o'); } if(this.isMultiplayer && this.gameState.currentPlayer!==this.mySymbol) cell.classList.add('disabled'); else cell.classList.remove('disabled'); });
        const p=this.gameState.currentPlayer; if(this.currentPlayerDisplay.textContent!==p){ this.currentPlayerDisplay.style.transform='scale(0.8)'; setTimeout(()=>{ this.currentPlayerDisplay.textContent=p; this.currentPlayerDisplay.className=p==='X'?'player-x':'player-o'; this.currentPlayerDisplay.style.transform='scale(1)'; },150); }
        this.animateScoreUpdate('score-x', this.gameState.scores.X); this.animateScoreUpdate('score-o', this.gameState.scores.O); this.animateScoreUpdate('score-draws', this.gameState.scores.draws);
        if(this.gameState.winningLine) this.gameState.winningLine.forEach(i=>this.cells[i].classList.add('winning'));
        let status=`Player ${this.gameState.currentPlayer}'s turn`; if(this.gameState.gameOver){ status=this.gameState.winner==='draw'?"It's a draw!":`Player ${this.gameState.winner} wins!`; } else if(this.isMultiplayer){ status=this.gameState.currentPlayer===this.mySymbol?'Your turn!':'Opponent\'s turn'; }
        this.showStatus(status,'active');
    }
    
    animateScoreUpdate(id,val){ const el=document.getElementById(id); const cur=parseInt(el.textContent); if(cur!==val){ el.style.transform='scale(1.5)'; el.style.color='var(--neon-green)'; setTimeout(()=>{ el.textContent=val; el.style.transform='scale(1)'; },200);} }
    handleGameEnd(){ this.isGameActive=false; setTimeout(()=>{ let msg=this.gameState.winner==='draw'?"IT'S A DRAW!":(this.isMultiplayer?(this.gameState.winner===this.mySymbol?'YOU WIN!':'YOU LOSE!'):`PLAYER ${this.gameState.winner} WINS!`); this.showVictoryOverlay(msg); this.createFireworks(); },1000); }
    createFireworks(){ for(let i=0;i<20;i++){ const fw=document.createElement('div'); fw.className='firework'; fw.style.cssText=`position:fixed;width:4px;height:4px;background:var(--neon-green);border-radius:50%;pointer-events:none;z-index:10000;left:${Math.random()*innerWidth}px;top:${Math.random()*innerHeight}px;box-shadow:0 0 10px var(--neon-green);animation: firework ${1+Math.random()}s ease-out forwards;`; document.body.appendChild(fw); setTimeout(()=>fw.remove(),2000);} if(!document.getElementById('firework-styles')){ const st=document.createElement('style'); st.id='firework-styles'; st.textContent='@keyframes firework{0%{transform:scale(0) rotate(0deg);opacity:1}100%{transform:scale(3) rotate(360deg);opacity:0}}'; document.head.appendChild(st);} }
    showVictoryOverlay(msg){ this.victoryText.textContent=msg; this.victoryOverlay.classList.add('show'); setTimeout(()=>this.hideVictoryOverlay(),4000); }
    hideVictoryOverlay(){ this.victoryOverlay.classList.remove('show'); }
    showStatus(msg,type='info'){ this.gameStatus.textContent=msg; this.gameStatus.className=`game-status ${type}`; if(type!=='active'){ setTimeout(()=>{ if(this.gameStatus.textContent===msg) this.gameStatus.textContent=''; },3000);} }
}

document.addEventListener('DOMContentLoaded', ()=> new TicTacToeMultiplayer());

document.addEventListener('mousemove',(e)=>{ document.querySelectorAll('.particle').forEach((p,i)=>{ const s=(i+1)*0.005; const x=(e.clientX-innerWidth/2)*s; const y=(e.clientY-innerHeight/2)*s; p.style.transform=`translate(${x}px, ${y}px)`; }); });

document.addEventListener('keydown',(e)=>{ const k=e.key.toLowerCase(); let msg=''; if(k==='r') msg='Restart Game (R pressed)'; if(k==='escape') msg='Close Overlay (ESC pressed)'; if(!msg) return; const n=document.createElement('div'); n.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:rgba(0,255,255,.9);color:#000;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:bold;z-index:10000;animation:keyFeedback 2s ease-out forwards;'; n.textContent=msg; document.body.appendChild(n); if(!document.getElementById('key-feedback-styles')){ const st=document.createElement('style'); st.id='key-feedback-styles'; st.textContent='@keyframes keyFeedback{0%{opacity:0;transform:translateX(-50%) translateY(-20px)}20%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-20px)}}'; document.head.appendChild(st);} setTimeout(()=>n.remove(),2000); });