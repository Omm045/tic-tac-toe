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
        this.soundEnabled = true;
        this.audioInitialized = false;
        
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
        this.initializeAudio();
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
        
        // Audio elements
        this.audioToast = document.getElementById('audio-toast');
        this.enableAudioBtn = document.getElementById('enable-audio-btn');
        
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
        
        // Audio events
        this.enableAudioBtn.addEventListener('click', () => this.enableAudio());
        
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
            if (e.key === 'm' || e.key === 'M') {
                this.toggleSound();
            }
            if (e.key >= '1' && e.key <= '9') {
                const position = parseInt(e.key) - 1;
                const cell = document.querySelector(`[data-index="${position}"]`);
                if (cell) {
                    cell.click();
                }
            }
        });
        
        this.createSoundToggle();
    }
    
    createSoundToggle() {
        const soundToggle = document.createElement('button');
        soundToggle.id = 'sound-toggle';
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = '🔊';
        soundToggle.title = 'Toggle Sound (M)';
        soundToggle.addEventListener('click', () => this.toggleSound());
        document.body.appendChild(soundToggle);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const toggle = document.getElementById('sound-toggle');
        
        if (this.soundEnabled) {
            toggle.innerHTML = '🔊';
            toggle.classList.remove('muted');
            toggle.title = 'Turn Sound Off (M)';
            if (this.sounds.background && this.sounds.background.paused) {
                this.sounds.background.play().catch(e => console.log('Background music play failed:', e));
            }
        } else {
            toggle.innerHTML = '🔇';
            toggle.classList.add('muted');
            toggle.title = 'Turn Sound On (M)';
            if (this.sounds.background && !this.sounds.background.paused) {
                this.sounds.background.pause();
            }
        }
        
        this.showStatus(this.soundEnabled ? 'Sound ON' : 'Sound OFF', 'info');
    }
    
    initializeAudio() {
        this.sounds = {
            move: document.getElementById('move-sound'),
            win: document.getElementById('win-sound'),
            draw: document.getElementById('draw-sound'),
            click: document.getElementById('click-sound'),
            background: document.getElementById('background-music')
        };
        
        // Set volumes and configure audio
        Object.entries(this.sounds).forEach(([key, sound]) => {
            if (sound) {
                if (key === 'background') {
                    sound.volume = 0.15;
                    sound.loop = true;
                } else {
                    sound.volume = 0.4;
                }
                
                sound.addEventListener('error', (e) => {
                    console.log(`Audio error for ${key}:`, e);
                });
            }
        });
        
        // Try to start background music automatically
        this.tryStartBackgroundMusic();
    }
    
    tryStartBackgroundMusic() {
        if (this.sounds.background && this.soundEnabled && !this.audioInitialized) {
            this.sounds.background.play().then(() => {
                this.audioInitialized = true;
                console.log('Background music started automatically');
            }).catch(() => {
                // Show audio enable toast if autoplay fails
                this.audioToast.classList.remove('hidden');
                console.log('Background music autoplay blocked, showing enable button');
            });
        }
    }
    
    enableAudio() {
        if (this.sounds.background) {
            this.sounds.background.play().then(() => {
                this.audioInitialized = true;
                this.audioToast.classList.add('hidden');
                this.showStatus('Audio enabled! 🎵', 'success');
            }).catch(e => {
                console.log('Failed to enable audio:', e);
                this.createBackupSound('click');
            });
        }
    }
    
    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => {
                console.log(`Sound play failed for ${soundName}:`, e);
                this.createBackupSound(soundName);
            });
        }
    }
    
    createBackupSound(soundType) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(soundType) {
                case 'move':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                    break;
                case 'win':
                    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                    break;
                case 'draw':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.05);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Backup sound creation failed:', e);
        }
    }
    
    // Multiplayer Methods
    toggleMultiplayerPanel() {
        this.multiplayerContent.classList.toggle('hidden');
    }
    
    async hostGame() {
        try {
            this.isHost = true;
            this.mySymbol = 'X';
            
            // Initialize PeerJS
            this.peer = new Peer(undefined, {
                host: 'peerjs-server.herokuapp.com',
                port: 443,
                path: '/peerjs',
                secure: true,
                debug: 2
            });
            
            this.peer.on('open', (id) => {
                this.roomIdDisplay.value = id;
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
            
            // Get user media
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
            
            // Initialize PeerJS
            this.peer = new Peer(undefined, {
                host: 'peerjs-server.herokuapp.com',
                port: 443,
                path: '/peerjs',
                secure: true,
                debug: 2
            });
            
            this.peer.on('open', async () => {
                // Connect to host
                this.connection = this.peer.connect(roomId);
                this.setupDataConnection();
                
                // Get user media and call host
                await this.startLocalVideo();
                this.call = this.peer.call(roomId, this.localStream);
                this.setupMediaConnection(this.call);
                
                this.isMultiplayer = true;
                this.gameModeIndicator.textContent = 'MULTIPLAYER - GUEST';
                this.showStatus('Connected to host!', 'success');
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
        if (!this.localStream) {
            await this.startLocalVideo();
        }
        
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
        this.connection.on('data', (data) => {
            this.handleRemoteMove(data);
        });
        
        this.connection.on('close', () => {
            this.disconnect();
        });
    }
    
    sendMove(position) {
        if (this.connection && this.connection.open) {
            this.connection.send({
                type: 'move',
                position: position,
                player: this.mySymbol,
                gameState: this.gameState
            });
        }
    }
    
    handleRemoteMove(data) {
        if (data.type === 'move') {
            // Apply the move from remote player
            this.gameState.board[data.position] = data.player;
            this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
            
            // Check for game end
            const result = this.checkWinner(this.gameState.board);
            if (result.winner) {
                this.gameState.gameOver = true;
                this.gameState.winner = result.winner;
                this.gameState.winningLine = result.line;
                
                if (result.winner === 'draw') {
                    this.gameState.scores.draws++;
                } else {
                    this.gameState.scores[result.winner]++;
                }
                
                this.saveScores();
                this.handleGameEnd();
            }
            
            this.updateUI();
        }
    }
    
    copyRoomId() {
        this.roomIdDisplay.select();
        document.execCommand('copy');
        this.showStatus('Room ID copied!', 'success');
    }
    
    toggleVideo() {
        if (this.localStream) {
            this.isVideoEnabled = !this.isVideoEnabled;
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = this.isVideoEnabled;
            });
            
            this.toggleVideoBtn.classList.toggle('muted', !this.isVideoEnabled);
            this.toggleVideoBtn.innerHTML = this.isVideoEnabled ? '📹' : '📹';
        }
    }
    
    toggleAudio() {
        if (this.localStream) {
            this.isAudioEnabled = !this.isAudioEnabled;
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = this.isAudioEnabled;
            });
            
            this.toggleAudioBtn.classList.toggle('muted', !this.isAudioEnabled);
            this.toggleAudioBtn.innerHTML = this.isAudioEnabled ? '🎤' : '🎤';
        }
    }
    
    disconnect() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.call) {
            this.call.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
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
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (let combo of winningCombinations) {
            if (board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]] && board[combo[0]] !== '') {
                return { winner: board[combo[0]], line: combo };
            }
        }
        
        if (!board.includes('')) {
            return { winner: 'draw', line: null };
        }
        
        return { winner: null, line: null };
    }
    
    handleCellClick(event) {
        const cell = event.target;
        const position = parseInt(cell.dataset.index);
        
        if (!this.isGameActive || this.gameState.gameOver || this.gameState.board[position] !== '') {
            return;
        }
        
        // In multiplayer, check if it's our turn
        if (this.isMultiplayer && this.gameState.currentPlayer !== this.mySymbol) {
            this.showStatus("Wait for your turn!", 'error');
            return;
        }
        
        // Make the move
        this.gameState.board[position] = this.gameState.currentPlayer;
        this.playSound('move');
        this.animateMove(cell);
        
        // Send move to remote player
        if (this.isMultiplayer) {
            this.sendMove(position);
        }
        
        // Check for winner
        const result = this.checkWinner(this.gameState.board);
        
        if (result.winner) {
            this.gameState.gameOver = true;
            this.gameState.winner = result.winner;
            this.gameState.winningLine = result.line;
            
            if (result.winner === 'draw') {
                this.gameState.scores.draws++;
            } else {
                this.gameState.scores[result.winner]++;
            }
            
            this.saveScores();
            this.handleGameEnd();
        } else {
            // Switch player
            this.gameState.currentPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
        }
        
        this.updateUI();
    }
    
    animateMove(cell) {
        cell.style.transform = 'scale(0.8)';
        cell.style.opacity = '0.5';
        
        setTimeout(() => {
            cell.style.transform = 'scale(1.1)';
            cell.style.opacity = '1';
            
            setTimeout(() => {
                cell.style.transform = 'scale(1)';
            }, 100);
        }, 50);
    }
    
    restartGame() {
        this.playSound('click');
        
        this.gameState = {
            board: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X',
            gameOver: false,
            winner: null,
            winningLine: null,
            scores: this.gameState.scores // Keep scores
        };
        
        this.isGameActive = true;
        this.hideVictoryOverlay();
        this.updateUI();
        this.showStatus('New game started!', 'success');
    }
    
    resetScores() {
        this.playSound('click');
        
        this.gameState.scores = { X: 0, O: 0, draws: 0 };
        this.saveScores();
        this.updateUI();
        this.showStatus('Scores reset!', 'success');
    }
    
    saveScores() {
        try {
            localStorage.setItem('ticTacToeScores', JSON.stringify(this.gameState.scores));
        } catch (e) {
            console.log('Could not save scores to localStorage:', e);
        }
    }
    
    loadScores() {
        try {
            const savedScores = localStorage.getItem('ticTacToeScores');
            if (savedScores) {
                this.gameState.scores = JSON.parse(savedScores);
            }
        } catch (e) {
            console.log('Could not load scores from localStorage:', e);
        }
    }
    
    updateUI() {
        // Update board
        this.cells.forEach((cell, index) => {
            const value = this.gameState.board[index];
            const oldValue = cell.textContent;
            
            if (oldValue !== value) {
                cell.textContent = value;
                cell.className = 'cell';
                
                if (value === 'X') {
                    cell.classList.add('x');
                } else if (value === 'O') {
                    cell.classList.add('o');
                }
            }
            
            // Disable cells for non-current player in multiplayer
            if (this.isMultiplayer && this.gameState.currentPlayer !== this.mySymbol) {
                cell.classList.add('disabled');
            } else {
                cell.classList.remove('disabled');
            }
        });
        
        // Update current player
        const newPlayer = this.gameState.currentPlayer;
        if (this.currentPlayerDisplay.textContent !== newPlayer) {
            this.currentPlayerDisplay.style.transform = 'scale(0.8)';
            setTimeout(() => {
                this.currentPlayerDisplay.textContent = newPlayer;
                this.currentPlayerDisplay.className = newPlayer === 'X' ? 'player-x' : 'player-o';
                this.currentPlayerDisplay.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Update scores
        this.animateScoreUpdate('score-x', this.gameState.scores.X);
        this.animateScoreUpdate('score-o', this.gameState.scores.O);
        this.animateScoreUpdate('score-draws', this.gameState.scores.draws);
        
        // Highlight winning cells
        if (this.gameState.winningLine) {
            this.gameState.winningLine.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
        
        // Update game status
        if (this.gameState.gameOver) {
            if (this.gameState.winner === 'draw') {
                this.showStatus("It's a draw!", 'draw');
            } else {
                this.showStatus(`Player ${this.gameState.winner} wins!`, 'win');
            }
        } else {
            let statusText = `Player ${this.gameState.currentPlayer}'s turn`;
            if (this.isMultiplayer) {
                statusText = this.gameState.currentPlayer === this.mySymbol ? 'Your turn!' : 'Opponent\'s turn';
            }
            this.showStatus(statusText, 'active');
        }
    }
    
    animateScoreUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent);
        
        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.5)';
            element.style.color = 'var(--neon-green)';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    handleGameEnd() {
        this.isGameActive = false;
        
        setTimeout(() => {
            if (this.gameState.winner === 'draw') {
                this.playSound('draw');
                this.showVictoryOverlay("IT'S A DRAW!");
            } else {
                this.playSound('win');
                let winMessage = `PLAYER ${this.gameState.winner} WINS!`;
                if (this.isMultiplayer) {
                    winMessage = this.gameState.winner === this.mySymbol ? 'YOU WIN!' : 'YOU LOSE!';
                }
                this.showVictoryOverlay(winMessage);
                this.createFireworks();
            }
        }, 1000);
    }
    
    createFireworks() {
        for (let i = 0; i < 20; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--neon-green);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                box-shadow: 0 0 10px var(--neon-green);
                animation: firework ${1 + Math.random()}s ease-out forwards;
            `;
            
            document.body.appendChild(firework);
            
            setTimeout(() => {
                firework.remove();
            }, 2000);
        }
        
        if (!document.getElementById('firework-styles')) {
            const style = document.createElement('style');
            style.id = 'firework-styles';
            style.textContent = `
                @keyframes firework {
                    0% {
                        transform: scale(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(3) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showVictoryOverlay(message) {
        this.victoryText.textContent = message;
        this.victoryOverlay.classList.add('show');
        
        setTimeout(() => {
            this.hideVictoryOverlay();
        }, 4000);
    }
    
    hideVictoryOverlay() {
        this.victoryOverlay.classList.remove('show');
    }
    
    showStatus(message, type = 'info') {
        this.gameStatus.textContent = message;
        this.gameStatus.className = `game-status ${type}`;
        
        if (type !== 'active') {
            setTimeout(() => {
                if (this.gameStatus.textContent === message) {
                    this.gameStatus.textContent = '';
                }
            }, 3000);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeMultiplayer();
});

// Interactive particle effects
document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.005;
        const x = (e.clientX - window.innerWidth / 2) * speed;
        const y = (e.clientY - window.innerHeight / 2) * speed;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Visual feedback for keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    let message = '';
    
    switch(key) {
        case 'r':
            message = 'Restart Game (R pressed)';
            break;
        case 'm':
            message = 'Toggle Sound (M pressed)';
            break;
        case 'escape':
            message = 'Close Overlay (ESC pressed)';
            break;
    }
    
    if (message) {
        const keyFeedback = document.createElement('div');
        keyFeedback.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 255, 0.9);
            color: black;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            animation: keyFeedback 2s ease-out forwards;
        `;
        keyFeedback.textContent = message;
        document.body.appendChild(keyFeedback);
        
        if (!document.getElementById('key-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'key-feedback-styles';
            style.textContent = `
                @keyframes keyFeedback {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    20% {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    80% {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            keyFeedback.remove();
        }, 2000);
    }
});