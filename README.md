# 🎮 Futuristic Tic Tac Toe

A premium, cyberpunk-inspired Tic Tac Toe game with a Python Flask backend and modern animated frontend.

## ✨ Features

### 🎨 Visual Design
- **Cyberpunk aesthetic** with neon blue, purple, and green color scheme
- **Animated particles** floating in the background that respond to mouse movement
- **Glowing effects** and smooth transitions throughout the UI
- **Glass morphism** UI elements with backdrop blur
- **Responsive design** for mobile and desktop
- **Victory fireworks** celebration animations

### 🎯 Game Features
- **Real-time gameplay** with Flask backend API
- **Score tracking** across multiple games with animated counters
- **Winning line highlighting** with glowing animations
- **Sound effects** for moves, wins, draws, and interactions
- **Victory overlay** with celebration animations and auto-hide
- **Sound toggle** with visual feedback (🔊/🔇)
- **Backup audio system** using Web Audio API if files fail to load

### ⌨️ Controls & Shortcuts
- **Mouse**: Click cells to play
- **Keyboard Numbers**: Press 1-9 for quick cell selection
- **R Key**: Restart game
- **M Key**: Toggle sound on/off
- **Escape Key**: Close victory overlay
- **Visual feedback** for all keyboard shortcuts

### 🔊 Audio System
- **Move sounds** - Cyberpunk-style beeps for placing X and O
- **Victory sounds** - Triumphant fanfare for wins
- **Draw sounds** - Neutral tone for tied games
- **Click sounds** - UI interaction feedback
- **Background music** - Ambient cyberpunk atmosphere (auto-starts)
- **Volume controls** and graceful fallbacks
- **Web Audio API backup** if MP3 files fail

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

## 🎮 How to Play

### Basic Gameplay
1. **Click any cell** to place your mark (X or O)
2. **Take turns** with your opponent
3. **Get three in a row** to win (horizontal, vertical, or diagonal)
4. **Watch the victory celebration** with fireworks and sound effects!

### Keyboard Shortcuts
- **1-9**: Quick cell selection (numbers correspond to grid positions)
- **R**: Restart the current game
- **M**: Toggle sound on/off
- **Esc**: Close victory overlay

### Sound Controls
- **Sound Toggle**: Click the 🔊 button in top-right corner
- **Auto-start**: Background music begins on first click
- **Fallback System**: If audio files fail, synthetic sounds are generated

## 🛠️ Technical Architecture

### Backend (Flask)
- **RESTful API** for game state management
- **Advanced game logic** with win detection and validation
- **Score persistence** across game sessions
- **CORS enabled** for seamless frontend communication
- **Error handling** and graceful degradation

### Frontend (Vanilla JS)
- **Modern ES6+ JavaScript** with class-based architecture
- **Fetch API** for real-time backend communication
- **CSS Grid & Flexbox** for responsive layouts
- **CSS Animations** with hardware acceleration
- **Web Audio API** for backup sound generation
- **Event-driven design** for smooth interactions

### Audio Implementation
- **HTML5 Audio** for primary sound playback
- **Web Audio API** for backup synthetic sounds
- **Volume management** and user controls
- **Error handling** with graceful fallbacks
- **Performance optimization** with audio preloading

## 📱 Responsive Design

The game automatically adapts to different screen sizes:
- **Desktop (1200px+)**: Full-size experience with larger cells and effects
- **Tablet (768px-1199px)**: Medium layout with touch optimization
- **Mobile (320px-767px)**: Compact design with finger-friendly controls

## 🎨 Customization

### Color Themes
Edit CSS variables in `static/css/styles.css`:
```css
:root {
    --neon-blue: #00ffff;    /* Primary accent color */
    --neon-purple: #ff00ff;  /* Secondary accent color */
    --neon-green: #39ff14;   /* Success/winning color */
    --dark-bg: #0a0a0f;      /* Main background */
    --darker-bg: #050507;    /* Darker background areas */
}
```

### Animation Speeds
Modify animation durations:
- **Cell animations**: `.cell` transition properties
- **Particle movement**: `@keyframes float` duration
- **Victory effects**: `.victory-animation` timing

### Sound Effects
Replace audio files in `static/audio/` with your own:
- **move.mp3**: Played when placing X or O
- **win.mp3**: Played on victory
- **draw.mp3**: Played on draw/tie
- **click.mp3**: Played on button clicks
- **background.mp3**: Ambient music (should be loopable)

## 🚀 Deployment

### Local Development
```bash
python app.py
# Game available at http://localhost:5000
```

### Production Deployment

#### Using Gunicorn (Recommended)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Using Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### Hosting Platforms
- **Heroku**: Add `Procfile` with `web: gunicorn app:app`
- **Railway**: Deploy directly from GitHub
- **Render**: Auto-deploy with `gunicorn app:app`
- **DigitalOcean App Platform**: Use provided buildpack

## 🔧 Troubleshooting

### Audio Issues
- **No sound**: Check browser audio permissions
- **Background music not playing**: Click anywhere to start audio context
- **Distorted audio**: Reduce volume in `initializeAudio()` method

### Performance Issues
- **Slow animations**: Reduce particle count in CSS
- **High CPU usage**: Disable background music or reduce animation complexity
- **Mobile lag**: Test on target devices and optimize accordingly

### Connectivity Issues
- **API errors**: Check Flask server is running on correct port
- **CORS errors**: Ensure Flask-CORS is properly configured
- **Timeout errors**: Increase request timeout in fetch calls

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Test on multiple browsers and devices
- Ensure audio works across different environments
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Orbitron font** from Google Fonts for the futuristic typography
- **CSS animations** inspired by modern cyberpunk design trends
- **Flask framework** for the robust and simple backend architecture
- **Web Audio API** for fallback sound generation
- **Cyberpunk aesthetic** inspired by Blade Runner and futuristic gaming interfaces

## 🎯 Future Enhancements

- **AI opponent** with difficulty levels
- **Online multiplayer** with WebSocket support
- **Tournament mode** with brackets
- **Custom themes** and color schemes
- **Achievement system** with unlockable rewards
- **Replay system** to review past games
- **Statistics dashboard** with detailed analytics

---

**Enjoy this futuristic gaming experience! 🎮✨**

*Press M to toggle sound • Press R to restart • Press 1-9 for quick moves*