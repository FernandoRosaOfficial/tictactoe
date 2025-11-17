// Simple Tic Tac Toe with optional Minimax AI (player is X, computer O)
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const vsComputerCheckbox = document.getElementById('vsComputer');

let board; // array of 9: 'X','O', or ''
let current; // 'X' or 'O'
let gameOver;

function createBoardElements() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role','gridcell');
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
}

function startGame() {
  board = Array(9).fill('');
  current = 'X';
  gameOver = false;
  updateStatus(`Turn: ${current}`);
  createBoardElements();
  render();
  // If vs computer and computer should start (not implemented choice here), we keep player X starting.
}

function render() {
  for (let i = 0; i < 9; i++) {
    const el = boardEl.querySelector(`[data-index="${i}"]`);
    el.textContent = board[i] || '';
    el.classList.toggle('x', board[i] === 'X');
    el.classList.toggle('o', board[i] === 'O');
    el.classList.toggle('disabled', !!board[i] || gameOver);
  }
}

function onCellClick(e) {
  if (gameOver) return;
  const idx = Number(e.currentTarget.dataset.index);
  if (board[idx]) return;
  makeMove(idx, current);
  render();
  const winner = checkWinner(board);
  if (winner) return finish(winner);
  current = current === 'X' ? 'O' : 'X';
  updateStatus(`Turn: ${current}`);

  if (!gameOver && vsComputerCheckbox.checked && current === 'O') {
    // let the browser render before heavy compute
    setTimeout(() => {
      const aiMove = getBestMove(board.slice(), 'O');
      makeMove(aiMove, 'O');
      render();
      const winner2 = checkWinner(board);
      if (winner2) return finish(winner2);
      current = 'X';
      updateStatus(`Turn: ${current}`);
    }, 200);
  }
}

function makeMove(idx, player) {
  if (board[idx] || gameOver) return false;
  board[idx] = player;
  return true;
}

function finish(winner) {
  gameOver = true;
  if (winner === 'tie') {
    updateStatus("It's a tie!");
  } else {
    updateStatus(`${winner} wins!`);
    highlightWin(winner);
  }
}

function updateStatus(text) {
  statusEl.textContent = text;
}

function highlightWin(player) {
  const lines = winningLines();
  for (const line of lines) {
    if (line.every(i => board[i] === player)) {
      for (const i of line) {
        const el = boardEl.querySelector(`[data-index="${i}"]`);
        el.style.boxShadow = `0 8px 30px ${player === 'X' ? 'rgba(96,165,250,.15)' : 'rgba(251,113,133,.15)'}`;
      }
      break;
    }
  }
}

function checkWinner(b) {
  const lines = winningLines();
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(Boolean)) return 'tie';
  return null;
}

function winningLines() {
  return [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
}

// Minimax for 3x3 Tic Tac Toe
function getBestMove(b, player) {
  // player is 'O' for AI here (minimizer or maximizer depending)
  const opponent = player === 'X' ? 'O' : 'X';

  function minimax(boardState, turn) {
    const winner = checkWinner(boardState);
    if (winner) {
      if (winner === 'X') return { score: -10 };
      if (winner === 'O') return { score: 10 };
      if (winner === 'tie') return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        const move = { index: i };
        boardState[i] = turn;
        const result = minimax(boardState, turn === 'O' ? 'X' : 'O');
        move.score = result.score;
        boardState[i] = '';
        moves.push(move);
      }
    }

    if (turn === 'O') {
      // maximizing for O
      let best = moves[0];
      for (const m of moves) if (m.score > best.score) best = m;
      return best;
    } else {
      // minimizing for X
      let best = moves[0];
      for (const m of moves) if (m.score < best.score) best = m;
      return best;
    }
  }

  const bestMove = minimax(b.slice(), player);
  return bestMove.index;
}

restartBtn.addEventListener('click', startGame);
vsComputerCheckbox.addEventListener('change', () => {
  // restart when toggling opponent
  startGame();
});

// initialize
startGame();