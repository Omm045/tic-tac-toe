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
        
        // Multiplayer properties
        this.isMultiplayer = false;
        this.isHost = false;
        this.mySymbol = 'X';
        this.peer = null;
        this.connection = null;
        
        this.loadScores();
        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
        this.checkAutoJoin();
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
        
        // Multiplayer + Chat elements
        this.multiplayerPanel = document.getElementById('multiplayer-panel');
        this.toggleMultiplayerBtn = document.getElementById('toggle-multiplayer');
        this.multiplayerContent = document.getElementById('multiplayer-content');
        
        // Quick start elements
        this.createRoomBtn = document.getElementById('create-room-btn');
        this.quickJoinInput = document.getElementById('quick-join-input');
        this.quickJoinBtn = document.getElementById('quick-join-btn');
        
        // Advanced elements
        this.hostBtn = document.getElementById('host-btn');
        this.joinBtn = document.getElementById('join-btn');
        this.hostSection = document.getElementById('host-section');
        this.joinSection = document.getElementById('join-section');
        this.roomIdDisplay = document.getElementById('room-id-display');
        this.copyIdBtn = document.getElementById('copy-id-btn');
        this.roomIdInput = document.getElementById('room-id-input');
        this.connectBtn = document.getElementById('connect-btn');
        
        // Chat elements
        this.chatBox = document.getElementById('chat-box');
        this.chatLog = document.getElementById('chat-log');
        this.chatInput = document.getElementById('chat-input');
        this.chatSend = document.getElementById('chat-send');
        this.disconnectBtn = document.getElementById('disconnect-btn');
    }
    
    setupEventListeners() {
        // Board clicks
        this.cells.forEach(cell => cell.addEventListener('click', (e) => this.handleCellClick(e)));
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
        this.victoryOverlay.addEventListener('click', () => this.hideVictoryOverlay());
        
        // Multiplayer
        this.toggleMultiplayerBtn.addEventListener('click', () => this.toggleMultiplayerPanel());
        
        // Quick start
        this.createRoomBtn.addEventListener('click', () => this.createRoomAndCopyLink());
        this.quickJoinBtn.addEventListener('click', () => this.quickJoin());
        this.quickJoinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.quickJoin(); });
        
        // Advanced
        this.hostBtn.addEventListener('click', () => this.hostGame());
        this.joinBtn.addEventListener('click', () => this.showJoinSection());
        this.copyIdBtn.addEventListener('click', () => this.copyRoomId());
        this.connectBtn.addEventListener('click', () => this.joinGame());
        
        // Chat
        this.chatSend.addEventListener('click', () => this.sendChat());
        this.chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.sendChat(); });
        
        // Disconnect
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') this.restartGame();
            if (e.key === 'Escape') this.hideVictoryOverlay();
            if (e.key >= '1' && e.key <= '9') {
                const position = parseInt(e.key) - 1;
                const cell = document.querySelector(`[data-index="${position}"]`);
                if (cell) cell.click();
            }
        });
    }
    
    checkAutoJoin() {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (code) {
            // Auto-open multiplayer panel and join
            this.multiplayerContent.classList.remove('hidden');
            this.quickJoinInput.value = code;
            this.showStatus('Room link detected. Click JOIN to connect!', 'info');
        }
    }
    
    toggleMultiplayerPanel() { 
        this.multiplayerContent.classList.toggle('hidden'); 
    }
    
    async createRoomAndCopyLink() {
        try {
            this.isHost = true;
            this.mySymbol = 'X';
            
            const maker = window.createTicTacToePeer || (()=>new window.Peer());
            this.peer = maker();
            
            this.peer.on('open', (id) => {
                const url = location.origin + location.pathname + '?code=' + encodeURIComponent(id);
                navigator.clipboard.writeText(url).then(() => {
                    this.createRoomBtn.textContent = 'LINK COPIED!';
                    setTimeout(() => {
                        this.createRoomBtn.textContent = 'CREATE ROOM & COPY LINK';
                    }, 2000);
                }).catch(() => {
                    // Fallback for older browsers
                    const input = document.createElement('input');
                    input.value = url;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    this.createRoomBtn.textContent = 'LINK COPIED!';
                });
                
                history.replaceState(null, '', '?code=' + encodeURIComponent(id));
                this.showStatus('Room created! Share the copied link.', 'success');
            });
            
            this.peer.on('connection', (conn) => {
                this.bindConnection(conn);
            });
            
        } catch (error) {
            console.error('Error creating room:', error);
            this.showStatus('Failed to create room', 'error');
        }
    }
    
    async quickJoin() {
        let input = this.quickJoinInput.value.trim();
        if (!input) {
            this.showStatus('Please paste a room link or code', 'error');
            return;
        }
        
        // Extract code from URL if full link was pasted
        if (input.includes('?code=')) {
            const url = new URL(input);
            input = url.searchParams.get('code') || input;
        }
        
        try {
            this.isHost = false;
            this.mySymbol = 'O';
            
            const maker = window.createTicTacToePeer || (()=>new window.Peer());
            this.peer = maker();
            
            this.peer.on('open', () => {
                const conn = this.peer.connect(input);
                this.bindConnection(conn);
            });
            
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.showStatus('Connection failed. Check the room link/code.', 'error');
            });
            
        } catch (error) {
            console.error('Error joining:', error);
            this.showStatus('Failed to join', 'error');
        }
    }
    
    // Legacy host/join methods (kept for advanced section)
    async hostGame() {
        try {
            this.isHost = true; this.mySymbol = 'X';
            const maker = window.createTicTacToePeer || (()=>new window.Peer());
            this.peer = maker();
            this.peer.on('open', (id) => {
                this.roomIdDisplay.value = id;
                history.replaceState(null, '', '?code=' + encodeURIComponent(id));
                this.hostSection.classList.remove('hidden');
                this.joinSection.classList.add('hidden');
                this.hostBtn.classList.add('active');
                this.joinBtn.classList.remove('active');
            });
            this.peer.on('connection', (conn) => { this.bindConnection(conn); });
        } catch (e) { console.error('Error hosting:', e); this.showStatus('Failed to host', 'error'); }
    }
    
    showJoinSection() {
        this.hostSection.classList.add('hidden');
        this.joinSection.classList.remove('hidden');
        this.hostBtn.classList.remove('active');
        this.joinBtn.classList.add('active');
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (code) this.roomIdInput.value = code;
    }
    
    async joinGame() {
        const roomId = this.roomIdInput.value.trim();
        if (!roomId) { this.showStatus('Please enter a Room ID', 'error'); return; }
        try {
            this.isHost = false; this.mySymbol = 'O';
            const maker = window.createTicTacToePeer || (()=>new window.Peer());
            this.peer = maker();
            this.peer.on('open', () => {
                const conn = this.peer.connect(roomId);
                this.bindConnection(conn);
            });
            this.peer.on('error', (err) => { console.error('Peer error:', err); this.showStatus('Connection error. Check Room ID.', 'error'); });
        } catch (e) { console.error('Error joining:', e); this.showStatus('Failed to join', 'error'); }
    }
    
    bindConnection(conn) {
        this.connection = conn;
        this.connection.on('open', () => {
            this.isMultiplayer = true;
            this.gameModeIndicator.textContent = this.isHost ? 'MULTIPLAYER - HOST' : 'MULTIPLAYER - GUEST';
            this.showStatus('Connected! Chat and play.', 'success');
            this.chatBox.style.display = 'block';
            this.appendChat('System', 'Connected! Say hello to your opponent.');
        });
        this.connection.on('data', (data) => this.handleIncomingData(data));
        this.connection.on('close', () => this.disconnect());
        this.connection.on('error', () => this.showStatus('Data channel error', 'error'));
    }
    
    // Chat
    sendChat() {
        if (!this.connection || !this.connection.open) return;
        const text = (this.chatInput.value || '').trim();
        if (!text) return;
        this.connection.send({ type: 'chat', text });
        this.appendChat('You', text);
        this.chatInput.value = '';
    }
    
    appendChat(sender, text) {
        const row = document.createElement('div');
        row.innerHTML = `<span style="color:var(--neon-blue);font-weight:bold;">${sender}:</span> ${text}`;
        this.chatLog.appendChild(row);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }
    
    // Data messages (moves + chat)
    sendMove(position) { if (this.connection?.open) this.connection.send({ type: 'move', position, player: this.mySymbol }); }
    
    handleIncomingData(data) {
        if (data.type === 'chat') { 
            this.appendChat('Opponent', data.text); 
            return; 
        }
        if (data.type !== 'move') return;
        this.gameState.board[data.position] = data.player;
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
        const result = this.checkWinner(this.gameState.board);
        if (result.winner) {
            this.gameState.gameOver = true; this.gameState.winner = result.winner; this.gameState.winningLine = result.line;
            if (result.winner === 'draw') this.gameState.scores.draws++; else this.gameState.scores[result.winner]++;
            this.saveScores(); this.handleGameEnd();
        }
        this.updateUI();
    }
    
    copyRoomId() { this.roomIdDisplay.select(); document.execCommand('copy'); this.showStatus('Room ID copied!', 'success'); }
    
    disconnect() {
        try { this.connection?.close(); } catch {}
        try { this.peer?.destroy(); } catch {}
        this.isMultiplayer = false; this.gameModeIndicator.textContent = 'LOCAL GAME';
        this.hostSection.classList.add('hidden'); this.joinSection.classList.add('hidden');
        this.hostBtn.classList.remove('active'); this.joinBtn.classList.remove('active');
        this.chatBox.style.display = 'none'; this.chatLog.innerHTML = '';
        this.showStatus('Disconnected from multiplayer', 'info'); this.restartGame();
    }
    
    // Game Logic
    checkWinner(b) { const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for (let c of w) if(b[c[0]]&&b[c[0]]===b[c[1]]&&b[c[1]]===b[c[2]]) return {winner:b[c[0]],line:c}; if(!b.includes('')) return {winner:'draw',line:null}; return {winner:null,line:null}; }
    
    handleCellClick(e) {
        const cell = e.target; const position = parseInt(cell.dataset.index);
        if (!this.isGameActive || this.gameState.gameOver || this.gameState.board[position] !== '') return;
        if (this.isMultiplayer && this.gameState.currentPlayer !== this.mySymbol) { this.showStatus('Wait for your turn!', 'error'); return; }
        this.gameState.board[position] = this.gameState.currentPlayer;
        if (this.isMultiplayer) this.sendMove(position);
        const r=this.checkWinner(this.gameState.board);
        if (r.winner) { this.gameState.gameOver=true; this.gameState.winner=r.winner; this.gameState.winningLine=r.line; if(r.winner==='draw') this.gameState.scores.draws++; else this.gameState.scores[r.winner]++; this.saveScores(); this.handleGameEnd(); }
        else { this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X'; }
        this.updateUI();
    }
    
    restartGame(){ this.gameState={ board:Array(9).fill(''), currentPlayer:'X', gameOver:false, winner:null, winningLine:null, scores:this.gameState.scores }; this.isGameActive=true; this.hideVictoryOverlay(); this.updateUI(); this.showStatus('New game started!','success'); }
    resetScores(){ this.gameState.scores={X:0,O:0,draws:0}; this.saveScores(); this.updateUI(); this.showStatus('Scores reset!','success'); }
    saveScores(){ try{ localStorage.setItem('ticTacToeScores', JSON.stringify(this.gameState.scores)); }catch{} }
    loadScores(){ try{ const s=localStorage.getItem('ticTacToeScores'); if(s) this.gameState.scores=JSON.parse(s); }catch{} }
    
    updateUI(){ 
        this.cells.forEach((cell,i)=>{ const v=this.gameState.board[i]; if(cell.textContent!==v){ cell.textContent=v; cell.className='cell'; if(v==='X') cell.classList.add('x'); if(v==='O') cell.classList.add('o'); } if(this.isMultiplayer && this.gameState.currentPlayer!==this.mySymbol) cell.classList.add('disabled'); else cell.classList.remove('disabled'); }); 
        const p=this.gameState.currentPlayer; if(this.currentPlayerDisplay.textContent!==p){ this.currentPlayerDisplay.style.transform='scale(0.8)'; setTimeout(()=>{ this.currentPlayerDisplay.textContent=p; this.currentPlayerDisplay.className=p==='X'?'player-x':'player-o'; this.currentPlayerDisplay.style.transform='scale(1)'; },150);} 
        this.animateScoreUpdate('score-x',this.gameState.scores.X); this.animateScoreUpdate('score-o',this.gameState.scores.O); this.animateScoreUpdate('score-draws',this.gameState.scores.draws); 
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