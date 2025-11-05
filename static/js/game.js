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
        });
    }
    
    initializeAudio() {
        this.sounds = {
            move: document.getElementById('move-sound'),
            win: document.getElementById('win-sound'),
            draw: document.getElementById('draw-sound'),
            click: document.getElementById('click-sound'),
            background: document.getElementById('background-music')
        };
        
        // Set volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.3;
            }
        });
        
        // Start background music
        if (this.sounds.background) {
            this.sounds.background.volume = 0.1;
            // Auto-play with user interaction
            document.addEventListener('click', () => {
                if (this.sounds.background.paused) {
                    this.sounds.background.play().catch(e => console.log('Audio play failed:', e));
                }
            }, { once: true });
        }
    }
    
    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => console.log('Sound play failed:', e));
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
        
        // Update board
        this.cells.forEach((cell, index) => {
            const value = this.gameState.board[index];
            cell.textContent = value;
            cell.className = 'cell';
            
            if (value === 'X') {
                cell.classList.add('x');
            } else if (value === 'O') {
                cell.classList.add('o');
            }
        });
        
        // Update current player
        this.currentPlayerDisplay.textContent = this.gameState.current_player;
        this.currentPlayerDisplay.className = this.gameState.current_player === 'X' ? 'player-x' : 'player-o';
        
        // Update scores
        this.scoreX.textContent = this.gameState.scores.X;
        this.scoreO.textContent = this.gameState.scores.O;
        this.scoreDraws.textContent = this.gameState.scores.draws;
        
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
    
    handleGameEnd() {
        this.isGameActive = false;
        
        setTimeout(() => {
            if (this.gameState.winner === 'draw') {
                this.playSound('draw');
                this.showVictoryOverlay("IT'S A DRAW!");
            } else {
                this.playSound('win');
                this.showVictoryOverlay(`PLAYER ${this.gameState.winner} WINS!`);
            }
        }, 1000);
    }
    
    showVictoryOverlay(message) {
        this.victoryText.textContent = message;
        this.victoryOverlay.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideVictoryOverlay();
        }, 3000);
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

// Add some interactive effects
document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.01;
        const x = e.clientX * speed;
        const y = e.clientY * speed;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') {
        const position = parseInt(e.key) - 1;
        const cell = document.querySelector(`[data-index="${position}"]`);
        if (cell) {
            cell.click();
        }
    }
});