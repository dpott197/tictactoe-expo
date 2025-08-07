import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Player = 'X' | 'O' | null;
type Board = Player[];

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

  const handleCellPress = (index: number) => {
    if (board[index] || gameWon) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setWinner(winner);
      setGameWon(true);
      Alert.alert('Game Over', `Player ${winner} wins!`);
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
  };

  const renderCell = (index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.cell}
      onPress={() => handleCellPress(index)}
    >
      <ThemedText style={styles.cellText}>{board[index]}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Tic Tac Toe</ThemedText>
      
      {!gameWon && (
        <ThemedText style={styles.currentPlayer}>
          Current Player: {currentPlayer}
        </ThemedText>
      )}
      
      {gameWon && (
        <ThemedText style={styles.gameOver}>
          {winner ? `Player ${winner} Wins!` : "It's a Draw!"}
        </ThemedText>
      )}

      <View style={styles.board}>
        {Array.from({ length: 9 }, (_, index) => renderCell(index))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <ThemedText style={styles.resetButtonText}>New Game</ThemedText>
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
  },
  cellText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
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