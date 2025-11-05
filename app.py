from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Game state
game_state = {
    'board': ['' for _ in range(9)],
    'current_player': 'X',
    'game_over': False,
    'winner': None,
    'winning_line': None,
    'scores': {'X': 0, 'O': 0, 'draws': 0}
}

def check_winner(board):
    # Winning combinations
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]
    
    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != '':
            return board[combo[0]], combo
    
    if '' not in board:
        return 'draw', None
    
    return None, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/game-state', methods=['GET'])
def get_game_state():
    return jsonify(game_state)

@app.route('/api/make-move', methods=['POST'])
def make_move():
    global game_state
    
    data = request.get_json()
    position = data.get('position')
    
    if game_state['game_over'] or game_state['board'][position] != '':
        return jsonify({'error': 'Invalid move'}), 400
    
    # Make the move
    game_state['board'][position] = game_state['current_player']
    
    # Check for winner
    winner, winning_line = check_winner(game_state['board'])
    
    if winner:
        game_state['game_over'] = True
        game_state['winner'] = winner
        game_state['winning_line'] = winning_line
        
        if winner == 'draw':
            game_state['scores']['draws'] += 1
        else:
            game_state['scores'][winner] += 1
    else:
        # Switch player
        game_state['current_player'] = 'O' if game_state['current_player'] == 'X' else 'X'
    
    return jsonify(game_state)

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    global game_state
    
    game_state['board'] = ['' for _ in range(9)]
    game_state['current_player'] = 'X'
    game_state['game_over'] = False
    game_state['winner'] = None
    game_state['winning_line'] = None
    
    return jsonify(game_state)

@app.route('/api/reset-scores', methods=['POST'])
def reset_scores():
    global game_state
    
    game_state['scores'] = {'X': 0, 'O': 0, 'draws': 0}
    
    return jsonify(game_state)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)