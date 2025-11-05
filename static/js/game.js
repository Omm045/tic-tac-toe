class TicTacToeGame {
    constructor() {
        this.gameState = null;
        this.isGameActive = true;
        this.soundEnabled = true;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadGameState();
        this.initializeAudio();
    }
    
    initializeElements() {
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
    }
    
    setupEventListeners() {
        // Cell click events
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        // Control button events
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
        
        // Victory overlay click to close
        this.victoryOverlay.addEventListener('click', () => this.hideVictoryOverlay());
        
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
        });
        
        // Add sound toggle button listener
        this.createSoundToggle();
    }
    
    createSoundToggle() {
        const soundToggle = document.createElement('button');
        soundToggle.id = 'sound-toggle';
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = '🔊';
        soundToggle.title = 'Toggle Sound (M)';
        soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Add styles for sound toggle
        const style = document.createElement('style');
        style.textContent = `
            .sound-toggle {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border: 2px solid var(--neon-blue);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                z-index: 1000;
            }
            .sound-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 0 20px var(--neon-blue);
            }
            .sound-toggle.muted {
                border-color: #666;
                color: #666;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(soundToggle);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const toggle = document.getElementById('sound-toggle');
        
        if (this.soundEnabled) {
            toggle.innerHTML = '🔊';
            toggle.classList.remove('muted');
            toggle.title = 'Turn Sound Off (M)';
            // Resume background music if it was playing
            if (this.sounds.background && this.sounds.background.paused) {
                this.sounds.background.play().catch(e => console.log('Background music play failed:', e));
            }
        } else {
            toggle.innerHTML = '🔇';
            toggle.classList.add('muted');
            toggle.title = 'Turn Sound On (M)';
            // Pause background music
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
                    sound.volume = 0.1;
                    sound.loop = true;
                } else {
                    sound.volume = 0.4;
                }
                
                // Add error handling
                sound.addEventListener('error', (e) => {
                    console.log(`Audio error for ${key}:`, e);
                });
            }
        });
        
        // Start background music on first user interaction
        this.backgroundMusicStarted = false;
        document.addEventListener('click', () => {
            if (!this.backgroundMusicStarted && this.sounds.background && this.soundEnabled) {
                this.sounds.background.play().catch(e => console.log('Background music play failed:', e));
                this.backgroundMusicStarted = true;
            }
        }, { once: true });
    }
    
    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            // Reset audio to beginning and play
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => {
                console.log(`Sound play failed for ${soundName}:`, e);
                // Create backup sound effect using Web Audio API
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
            
            // Different sound patterns for different actions
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
    
    async loadGameState() {
        try {
            const response = await fetch('/api/game-state');
            this.gameState = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error loading game state:', error);
            this.showStatus('Connection error. Please refresh the page.', 'error');
        }
    }
    
    async handleCellClick(event) {
        const cell = event.target;
        const position = parseInt(cell.dataset.index);
        
        if (!this.isGameActive || this.gameState.game_over || this.gameState.board[position] !== '') {
            return;
        }
        
        try {
            const response = await fetch('/api/make-move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ position })
            });
            
            if (response.ok) {
                this.gameState = await response.json();
                this.playSound('move');
                this.animateMove(cell);
                this.updateUI();
                
                if (this.gameState.game_over) {
                    this.handleGameEnd();
                }
            } else {
                const error = await response.json();
                this.showStatus(error.error, 'error');
            }
        } catch (error) {
            console.error('Error making move:', error);
            this.showStatus('Connection error. Please try again.', 'error');
        }
    }
    
    animateMove(cell) {
        // Add special animation for move placement
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
    
    async restartGame() {
        this.playSound('click');
        
        try {
            const response = await fetch('/api/reset-game', {
                method: 'POST'
            });
            
            if (response.ok) {
                this.gameState = await response.json();
                this.isGameActive = true;
                this.hideVictoryOverlay();
                this.updateUI();
                this.showStatus('New game started!', 'success');
            }
        } catch (error) {
            console.error('Error restarting game:', error);
            this.showStatus('Error restarting game. Please try again.', 'error');
        }
    }
    
    async resetScores() {
        this.playSound('click');
        
        try {
            const response = await fetch('/api/reset-scores', {
                method: 'POST'
            });
            
            if (response.ok) {
                this.gameState = await response.json();
                this.updateUI();
                this.showStatus('Scores reset!', 'success');
            }
        } catch (error) {
            console.error('Error resetting scores:', error);
            this.showStatus('Error resetting scores. Please try again.', 'error');
        }
    }
    
    updateUI() {
        if (!this.gameState) return;
        
        // Update board with smooth transitions
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
        });
        
        // Update current player with transition
        const newPlayer = this.gameState.current_player;
        if (this.currentPlayerDisplay.textContent !== newPlayer) {
            this.currentPlayerDisplay.style.transform = 'scale(0.8)';
            setTimeout(() => {
                this.currentPlayerDisplay.textContent = newPlayer;
                this.currentPlayerDisplay.className = newPlayer === 'X' ? 'player-x' : 'player-o';
                this.currentPlayerDisplay.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Update scores with animations
        this.animateScoreUpdate('score-x', this.gameState.scores.X);
        this.animateScoreUpdate('score-o', this.gameState.scores.O);
        this.animateScoreUpdate('score-draws', this.gameState.scores.draws);
        
        // Highlight winning cells
        if (this.gameState.winning_line) {
            this.gameState.winning_line.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
        
        // Update game status
        if (this.gameState.game_over) {
            if (this.gameState.winner === 'draw') {
                this.showStatus("It's a draw!", 'draw');
            } else {
                this.showStatus(`Player ${this.gameState.winner} wins!`, 'win');
            }
        } else {
            this.showStatus(`Player ${this.gameState.current_player}'s turn`, 'active');
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
                this.showVictoryOverlay(`PLAYER ${this.gameState.winner} WINS!`);
                this.createFireworks();
            }
        }, 1000);
    }
    
    createFireworks() {
        // Create celebratory particle effect
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
        
        // Add firework animation if not exists
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
        
        // Auto-hide after 4 seconds
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
        
        // Clear status after 3 seconds for non-permanent messages
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
    new TicTacToeGame();
});

// Add interactive particle effects
document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.005;
        const x = (e.clientX - window.innerWidth / 2) * speed;
        const y = (e.clientY - window.innerHeight / 2) * speed;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Add keyboard navigation for cells
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') {
        const position = parseInt(e.key) - 1;
        const cell = document.querySelector(`[data-index="${position}"]`);
        if (cell) {
            cell.click();
        }
    }
});

// Add visual feedback for keyboard shortcuts
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
            top: 50px;
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
        
        // Add animation if not exists
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