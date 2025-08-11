import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameMode = 'pvp' | 'pva';
type Difficulty = 'easy' | 'medium' | 'hard';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pva');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const checkWinner = (board: Board): Player => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const checkDraw = (board: Board): boolean => {
    return board.every(cell => cell !== null) && !checkWinner(board);
  };

  // AI Logic - Minimax Algorithm
  const minimax = (board: Board, depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number => {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 10 - depth; // AI wins
    if (winner === 'X') return depth - 10; // Human wins
    if (checkDraw(board)) return 0; // Draw
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (board: Board, difficulty: Difficulty): number => {
    // Easy mode: 30% optimal moves, 70% random
    // Medium mode: 70% optimal moves, 30% random  
    // Hard mode: 100% optimal moves
    
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];
    
    if (difficulty === 'easy' && Math.random() < 0.7) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    if (difficulty === 'medium' && Math.random() < 0.3) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    let bestMove = -1;
    let bestScore = -Infinity;
    
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  };

  const makeAiMove = (currentBoard: Board) => {
    setIsAiThinking(true);
    
    setTimeout(() => {
      const aiMove = getBestMove([...currentBoard], difficulty);
      const newBoard = [...currentBoard];
      newBoard[aiMove] = 'O';
      setBoard(newBoard);
      
      const winner = checkWinner(newBoard);
      if (winner) {
        setWinner(winner);
        setGameWon(true);
        Alert.alert('Game Over', winner === 'O' ? 'AI wins!' : 'You win!');
      } else if (checkDraw(newBoard)) {
        setGameWon(true);
        Alert.alert('Game Over', "It's a draw!");
      } else {
        setCurrentPlayer('X');
      }
      
      setIsAiThinking(false);
    }, 500); // AI thinking delay
  };

  useEffect(() => {
    if (gameMode === 'pva' && currentPlayer === 'O' && !gameWon && !isAiThinking) {
      makeAiMove(board);
    }
  }, [currentPlayer, gameMode, gameWon, board, isAiThinking]);

  const handleCellPress = (index: number) => {
    if (board[index] || gameWon || isAiThinking) return;
    
    // In AI mode, prevent clicking when it's AI's turn
    if (gameMode === 'pva' && currentPlayer === 'O') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setWinner(winner);
      setGameWon(true);
      const message = gameMode === 'pva' 
        ? (winner === 'X' ? 'You win!' : 'AI wins!')
        : `Player ${winner} wins!`;
      Alert.alert('Game Over', message);
    } else if (checkDraw(newBoard)) {
      setGameWon(true);
      Alert.alert('Game Over', "It's a draw!");
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameWon(false);
    setWinner(null);
    setIsAiThinking(false);
  };

  const renderCell = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.cell,
        isAiThinking && styles.disabledCell,
        board[index] && styles.filledCell
      ]}
      onPress={() => handleCellPress(index)}
      disabled={isAiThinking || !!board[index] || gameWon}
    >
      <ThemedText style={[
        styles.cellText,
        board[index] === 'X' && styles.playerXText,
        board[index] === 'O' && styles.playerOText
      ]}>
        {board[index]}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>🎮 Tic Tac Toe</ThemedText>
      
      {/* Game Mode Selection */}
      <View style={styles.modeSelector}>
        <TouchableOpacity 
          style={[styles.modeButton, gameMode === 'pvp' && styles.activeModeButton]}
          onPress={() => {
            setGameMode('pvp');
            resetGame();
          }}
        >
          <ThemedText style={[styles.modeButtonText, gameMode === 'pvp' && styles.activeModeButtonText]}>
            👥 Player vs Player
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeButton, gameMode === 'pva' && styles.activeModeButton]}
          onPress={() => {
            setGameMode('pva');
            resetGame();
          }}
        >
          <ThemedText style={[styles.modeButtonText, gameMode === 'pva' && styles.activeModeButtonText]}>
            🤖 Player vs AI
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Difficulty Selection for AI Mode */}
      {gameMode === 'pva' && (
        <View style={styles.difficultySelector}>
          <ThemedText style={styles.difficultyLabel}>AI Difficulty:</ThemedText>
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[styles.difficultyButton, difficulty === diff && styles.activeDifficultyButton]}
                onPress={() => {
                  setDifficulty(diff);
                  resetGame();
                }}
              >
                <ThemedText style={[styles.difficultyButtonText, difficulty === diff && styles.activeDifficultyButtonText]}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Current Player Status */}
      {!gameWon && (
        <ThemedText style={styles.currentPlayer}>
          {gameMode === 'pva' 
            ? (currentPlayer === 'X' ? 'Your Turn (X)' : isAiThinking ? '🤖 AI is thinking...' : 'AI Turn (O)')
            : `Current Player: ${currentPlayer}`
          }
        </ThemedText>
      )}
      
      {gameWon && (
        <ThemedText style={styles.gameOver}>
          {winner 
            ? (gameMode === 'pva' 
                ? (winner === 'X' ? '🎉 You Win!' : '🤖 AI Wins!')
                : `🎉 Player ${winner} Wins!`
              )
            : "🤝 It's a Draw!"
          }
        </ThemedText>
      )}

      <View style={styles.board}>
        {Array.from({ length: 9 }, (_, index) => renderCell(index))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <ThemedText style={styles.resetButtonText}>🔄 New Game</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
    fontSize: 28,
    fontWeight: 'bold',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeModeButtonText: {
    color: 'white',
  },
  difficultySelector: {
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeDifficultyButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  activeDifficultyButtonText: {
    color: 'white',
  },
  currentPlayer: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  gameOver: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  cell: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  filledCell: {
    backgroundColor: '#e8f4fd',
    borderColor: '#007AFF',
  },
  disabledCell: {
    opacity: 0.6,
  },
  cellText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  playerXText: {
    color: '#FF6B35',
  },
  playerOText: {
    color: '#4ECDC4',
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});