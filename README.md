# 🎮 Futuristic Tic Tac Toe

A premium, cyberpunk-inspired Tic Tac Toe game with a Python Flask backend and modern animated frontend.

## ✨ Features

### 🎨 Visual Design
- **Cyberpunk aesthetic** with neon blue, purple, and green color scheme
- **Animated particles** floating in the background
- **Glowing effects** and smooth transitions
- **Glass morphism** UI elements with backdrop blur
- **Responsive design** for mobile and desktop

### 🎯 Game Features
- **Real-time gameplay** with Flask backend
- **Score tracking** across multiple games
- **Winning line highlighting** with animations
- **Sound effects** for moves, wins, and interactions
- **Victory overlay** with celebration animations
- **Keyboard shortcuts** (R for restart, 1-9 for moves, Esc to close overlay)

### 🔊 Audio System
- **Background music** (ambient cyberpunk theme)
- **Move sounds** for placing X and O
- **Victory/draw sounds** for game endings
- **Button click sounds** for interactions
- **Volume controls** and graceful fallbacks

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omm045/tic-tac-toe.git
   cd tic-tac-toe
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 🎵 Adding Audio Files

To complete the audio experience, add these files to the `static/audio/` directory:

- `move.mp3` - Sound for placing X or O
- `win.mp3` - Victory sound
- `draw.mp3` - Draw game sound  
- `click.mp3` - Button click sound
- `background.mp3` - Ambient background music (loopable)

**Recommended sources for free audio:**
- [Freesound.org](https://freesound.org)
- [Zapsplat](https://zapsplat.com)
- [YouTube Audio Library](https://studio.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ/music)

## 🎮 How to Play

1. **Click any cell** to place your mark (X or O)
2. **Take turns** with your opponent
3. **Get three in a row** to win (horizontal, vertical, or diagonal)
4. **Use keyboard shortcuts:**
   - Press `1-9` to quickly select cells
   - Press `R` to restart the game
   - Press `Esc` to close victory overlay

## 🛠️ Technical Architecture

### Backend (Flask)
- **RESTful API** for game state management
- **Game logic** for win detection and validation
- **Score tracking** with persistent state
- **CORS enabled** for frontend communication

### Frontend (Vanilla JS)
- **Modern ES6+ JavaScript** with classes
- **Fetch API** for backend communication
- **CSS Grid** for responsive game board
- **CSS Animations** for smooth interactions
- **Event-driven architecture** for real-time updates

## 📱 Responsive Design

The game automatically adapts to different screen sizes:
- **Desktop**: Full-size experience with larger cells
- **Tablet**: Medium-sized layout with touch optimization
- **Mobile**: Compact design with finger-friendly controls

## 🎨 Customization

### Colors
Edit CSS variables in `static/css/styles.css`:
```css
:root {
    --neon-blue: #00ffff;
    --neon-purple: #ff00ff;
    --neon-green: #39ff14;
    --dark-bg: #0a0a0f;
    --darker-bg: #050507;
}
```

### Animations
Modify animation durations and effects in the CSS file to customize the visual experience.

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
For production, consider using:
- **Gunicorn** as WSGI server
- **Nginx** as reverse proxy
- **Docker** for containerization

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Orbitron font** from Google Fonts
- **CSS animations** inspired by modern web design trends
- **Flask framework** for the robust backend
- **Cyberpunk aesthetic** inspired by futuristic gaming interfaces

---

**Enjoy playing this futuristic Tic Tac Toe game! 🎮✨**