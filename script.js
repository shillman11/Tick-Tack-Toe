const cells = document.querySelectorAll(".button");
const restartButton = document.querySelector(".restart-button");
const display = document.querySelector(".display");
const playerButtonX = document.querySelector("#X");
const playerButtonO = document.querySelector("#O");

playerButtonX.addEventListener("click", () => {
  playerButtonO.className = "player-button";
  playerButtonX.className = "player-button-active";
  gameController.setPlayerToggle(true);
  gameController.restartGame();
});

playerButtonO.addEventListener("click", () => {
  playerButtonX.className = "player-button";
  playerButtonO.className = "player-button-active";
  gameController.setPlayerToggle(false);
  gameController.restartGame();
});

const gameBoard = (() => {
  const board = new Array("", "", "", "", "", "", "", "", "");
  const updateBoard = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = cells[i].textContent;
    }
  };
  const getBoard = () => board;

  return {
    getBoard,
    updateBoard,
  };
})();

const gameController = (() => {
  let endGameState = false;
  let playerTurn = 1;
  let gameTurn = 0;
  let playerToggle = true;

  const getGameTurn = () => gameTurn;
  const getPlayerTurn = () => playerTurn;
  const getPlayerToggle = () => playerToggle;

  const setPlayerToggle = (newToggle) => {
    playerToggle = newToggle;
  };

  const changePlayerTurn = () => {
    if (playerTurn === 0) {
      playerTurn = 1;
      gameTurn++;
    } else {
      playerTurn = 0;
      gameTurn++;
    }
  };

  const playTurn = (e) => {
    if (getPlayerTurn() === 1) {
      e.target.textContent = "X";
    } else e.target.textContent = "O";
  };

  const isGameOver = () => {
    for (let i = 0; i < 3; i++) {
      //check rows
      if (
        gameBoard.getBoard()[i * 3] === gameBoard.getBoard()[i * 3 + 1] &&
        gameBoard.getBoard()[i * 3] === gameBoard.getBoard()[i * 3 + 2] &&
        gameBoard.getBoard()[i * 3] !== ""
      ) {
        getWinner();
        endGame();
      }

      //check columns
      else if (
        gameBoard.getBoard()[i] === gameBoard.getBoard()[i + 3] &&
        gameBoard.getBoard()[i] === gameBoard.getBoard()[i + 6] &&
        gameBoard.getBoard()[i] !== ""
      ) {
        getWinner();
        endGame();
      }
    }

    //check diagnal
    if (
      gameBoard.getBoard()[0] === gameBoard.getBoard()[4] &&
      gameBoard.getBoard()[0] === gameBoard.getBoard()[8] &&
      gameBoard.getBoard()[0] !== ""
    ) {
      getWinner();
      endGame();
    } else if (
      gameBoard.getBoard()[2] === gameBoard.getBoard()[4] &&
      gameBoard.getBoard()[2] === gameBoard.getBoard()[6] &&
      gameBoard.getBoard()[2] !== ""
    ) {
      getWinner();
      endGame();
    }

    //check Tie
    if (getGameTurn() === 9 && endGameState === false) {
      display.textContent = "It's a tie!";
      endGame();
    }
  };

  const endGame = () => {
    endGameState = true;
    cells.forEach((button) => {
      button.removeEventListener("click", clickHandler);
    });
  };

  const restartGame = () => {
    for (let i = 0; i < cells.length; i++) {
      cells[i].textContent = "";
    }
    enableButtons();
    playerTurn = 1;
    gameTurn = 0;
    endGameState = false;
    display.textContent = "";
    gameBoard.updateBoard();
    if (playerToggle === false) {
      computer.computerMove();
    }
  };

  const enableButtons = () => {
    cells.forEach((button) => {
      button.addEventListener("click", clickHandler);
    });

    restartButton.addEventListener("click", restartHandler);
  };

  function clickHandler(e) {
    if (e.target.textContent === "") {
      gameController.playTurn(e);
      gameController.changePlayerTurn();
      gameBoard.updateBoard();
      e.target.removeEventListener("click", clickHandler);
      gameController.isGameOver();
      if (endGameState === false) {
        setTimeout(function () {
          computer.computerMove();
        }, 200);
      }
    }
  }

  function restartHandler(e) {
    restartButton.removeEventListener("click", restartHandler);
    restartGame();
  }

  const getWinner = () => {
    if (getPlayerTurn() === 1) {
      display.textContent = "O is the winner!";
    } else {
      display.textContent = "X is the winner!";
    }
  };

  return {
    getPlayerTurn,
    changePlayerTurn,
    getGameTurn,
    isGameOver,
    endGame,
    playTurn,
    enableButtons,
    restartGame,
    getPlayerToggle,
    setPlayerToggle,
  };
})();

const computer = (() => {
  const EMPTY = "";
  let computerTurn;
  let playerTurn;

  // Evaluate the game board and return a utility score.
  const utility = (board) => {
    // For example, if "O" wins:
    if (checkWin(board, computerTurn)) {
      return 1;
    }
    // If "X" wins:
    else if (checkWin(board, playerTurn)) {
      return -1;
    }
    // If it's a tie:
    else if (isBoardFull(board)) {
      return 0;
    }
    // The game is still ongoing:
    else {
      return null;
    }
  };

  // Recursive minimax function.
  const minimax = (board, depth, isMaximizing) => {
    const score = utility(board);

    // Check if the game is over or if you've reached a leaf node (depth 0).
    if (score !== null) {
      return score;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
          board[i] = computerTurn;
          const score = minimax(board, depth + 1, false);
          board[i] = EMPTY; // Undo the move
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
          board[i] = playerTurn;
          const score = minimax(board, depth + 1, true);
          board[i] = EMPTY; // Undo the move
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const computerMove = () => {
    const board = gameBoard.getBoard();
    let bestMove = -1;

    if (gameController.getPlayerTurn() === 1) {
      computerTurn = "X";
      playerTurn = "O";
    } else {
      computerTurn = "O";
      playerTurn = "X";
    }

    //check next move for win
    for (let i = 0; i < board.length; i++) {
      if (board[i] === EMPTY) {
        board[i] = computerTurn; // Assume the computer is "O"
        if (checkWin(board, computerTurn)) {
          bestMove = i;
          break; // Stop searching if a winning move is found
        }
        board[i] = EMPTY; // Undo the move
      }
    }

    //original call to minimax
    if (bestMove === -1) {
      let bestScore = -Infinity;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
          board[i] = computerTurn; // Assume the computer is "O"
          const score = minimax(board, 0, false);
          board[i] = EMPTY; // Undo the move

          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
    }

    cells[bestMove].textContent = computerTurn; // Make the best move
    gameController.changePlayerTurn();
    gameBoard.updateBoard();
    gameController.isGameOver();
  };

  // Helper function to check if a player has won.
  const checkWin = (board, player) => {
    // Check rows, columns, and diagonals for a win.
    // Implement this based on your game logic.
    // Return true if the player has won; otherwise, return false.

    for (let i = 0; i < 3; i++) {
      //check rows
      if (
        board[i * 3] === player &&
        board[i * 3 + 1] === player &&
        board[i * 3 + 2] === player
      ) {
        return true;
      }

      //check columns
      if (
        board[i] === player &&
        board[i + 3] === player &&
        board[i + 6] === player
      ) {
        return true;
      }
    }

    //check diagnal
    if (board[0] === player && board[4] === player && board[8] === player) {
      return true;
    }

    if (board[2] === player && board[4] === player && board[6] === player) {
      return true;
    }

    return false;
  };

  // Helper function to check if the game board is full (a tie).
  const isBoardFull = (board) => {
    return !board.includes(EMPTY);
  };

  return {
    computerMove,
  };
})();

gameController.enableButtons();
