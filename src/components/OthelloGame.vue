<template>
  <!-- eslint-disable-next-line vue/multi-word-component-names -->
  <div class="game-container">
    <h1 class="game-title">Othello Game</h1>
    <div class="othelloBoard">
      <div class="container">
        <div class="board">
          <div v-for="(column, colIndex) in cells" :key="colIndex">
            <div v-for="(disc, rowIndex) in column" :key="rowIndex" class="cell" @click="handleClick(colIndex, rowIndex)">
              <div v-if="disc === BLACK" class="disc black"></div>
              <div v-else-if="disc === WHITE" class="disc white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="control-panel">
      <button class="control-btn" @click="restart">リスタート</button>
      <button class="control-btn" @click="handlePass">パス</button>
    </div>

    <div class="message-area">{{ gameMessage }}</div>

    <!-- 結果表示用ダイアログ -->
    <div v-if="showResultModal" class="modal-overlay" @click="showResultModal = false">
      <div class="modal-content" @click.stop>
        <h2>Game Results</h2>
        <p class="result-text">{{ resultText }}</p>
        <button class="modal-close-btn" @click="restart">もう一度遊ぶ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- 定数定義 ---
const EMPTY = 0;
const BLACK = 1;
const WHITE = -1;
const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1],
  [1, 0],            [1, 1],
  [0, 1],   [-1, 1], [-1, 0]
];

// --- 状態（State） ---
const cells = ref(createInitialBoard());
const myStoneColor = ref(BLACK);
const rivalStoneColor = ref(WHITE);
const passCount = ref(0);
const gameMessage = ref('');
const showResultModal = ref(false);
const resultText = ref('');

// --- 算出プロパティ（Computed） ---
const hasEmptyCell = computed(() => cells.value.some(row => row.includes(EMPTY)));

// --- 関数（Methods） ---

function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
  board[3][3] = BLACK;
  board[4][4] = BLACK;
  board[3][4] = WHITE;
  board[4][3] = WHITE;
  return board;
}

const checkBoardEnd = (col, row) => col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE;

/**
 * 特定の方向に対してひっくり返せるマスの座標リストを返す
 */
function getFlippableInDirection(col, row, dCol, dRow, myColor, rivalColor) {
  let c = col + dCol;
  let r = row + dRow;
  const path = [];

  if (!checkBoardEnd(c, r) || cells.value[c][r] !== rivalColor) return [];

  while (checkBoardEnd(c, r)) {
    if (cells.value[c][r] === myColor) return path;
    if (cells.value[c][r] === EMPTY) return [];
    path.push([c, r]);
    c += dCol;
    r += dRow;
  }
  return [];
}

/**
 * 全方向でひっくり返せる全てのマスの座標リストを返す
 */
function getAllFlippable(col, row, myColor, rivalColor) {
  if (cells.value[col][row] !== EMPTY) return [];
  return DIRECTIONS.reduce((acc, [dCol, dRow]) => {
    return acc.concat(getFlippableInDirection(col, row, dCol, dRow, myColor, rivalColor));
  }, []);
}

function handleClick(col, row) {
  const flippable = getAllFlippable(col, row, myStoneColor.value, rivalStoneColor.value);
  if (flippable.length === 0) return;

  gameMessage.value = '';
  cells.value[col][row] = myStoneColor.value;
  flippable.forEach(([c, r]) => {
    cells.value[c][r] = myStoneColor.value;
  });

  passCount.value = 0;
  changeTurn();
}

function changeTurn() {
  // ターン交代
  const nextColor = myStoneColor.value === BLACK ? WHITE : BLACK;
  const nextRivalColor = myStoneColor.value === BLACK ? BLACK : WHITE;
  
  myStoneColor.value = nextColor;
  rivalStoneColor.value = nextRivalColor;

  if (!hasEmptyCell.value) {
    setTimeout(finish, 100);
    return;
  }

  // 置ける場所があるかチェック
  const canMove = Array.from({ length: BOARD_SIZE }).some((_, c) => 
    Array.from({ length: BOARD_SIZE }).some((_, r) => getAllFlippable(c, r, myStoneColor.value, rivalStoneColor.value).length > 0)
  );

  if (!canMove) {
    if (passCount.value >= 1) {
      setTimeout(finish, 100);
    } else {
      handlePass();
    }
    return;
  }

  if (myStoneColor.value === WHITE) {
    setTimeout(cpuAction, 500);
  }
}

function handlePass() {
  const player = myStoneColor.value === BLACK ? "あなた" : "CPU";
  gameMessage.value = `${player}は置ける場所がないため、スキップします。`;
  passCount.value++;
  setTimeout(changeTurn, 1000);
}

function cpuAction() {
  let maxFlipped = 0;
  let bestMoves = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const count = getAllFlippable(c, r, WHITE, BLACK).length;
      if (count > 0) {
        if (count > maxFlipped) {
          maxFlipped = count;
          bestMoves = [[c, r]];
        } else if (count === maxFlipped) {
          bestMoves.push([c, r]);
        }
      }
    }
  }

  if (bestMoves.length > 0) {
    const [c, r] = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    handleClick(c, r);
  } else {
    handlePass();
  }
}

function finish() {
  const flatCells = cells.value.flat();
  const blackCount = flatCells.filter(c => c === BLACK).length;
  const whiteCount = flatCells.filter(c => c === WHITE).length;

  if (blackCount > whiteCount) {
    resultText.value = `You Win! (黒: ${blackCount}, 白: ${whiteCount})`;
  } else if (blackCount < whiteCount) {
    resultText.value = `You Lose... (黒: ${blackCount}, 白: ${whiteCount})`;
  } else {
    resultText.value = `Draw! (黒: ${blackCount}, 白: ${whiteCount})`;
  }
  showResultModal.value = true;
}

function restart() {
  cells.value = createInitialBoard();
  myStoneColor.value = BLACK;
  rivalStoneColor.value = WHITE;
  passCount.value = 0;
  gameMessage.value = '';
  showResultModal.value = false;
  resultText.value = '';
}
</script>

<style>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 10px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.game-title {
  margin: 10px 0 15px 0;
  color: #2c3e50;
  font-size: 1.8em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.othelloBoard {
  display: inline-block;
  padding: 10px;
  background: #2c3e50;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  margin-bottom: 15px;
}

.control-panel {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.control-btn {
  padding: 8px 16px;
  font-size: 0.9em;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background-color: #2c3e50;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.control-btn:hover {
  background-color: #3e5871;
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(0);
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.board {
  display: flex;
  flex-direction: row;
  background: #1e5631;
  border: 4px solid #1e5631;
  border-radius: 4px;
}

.cell {
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: background 0.2s;
}

.cell:hover {
  background: rgba(255, 255, 255, 0.1);
}

.disc {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
  animation: appear 0.3s ease-out;
}

@keyframes appear {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.white {
  background: radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
}

.black {
  background: radial-gradient(circle at 30% 30%, #444, #111);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
}

.message-area {
  margin-top: 10px;
  height: 24px;
  color: #d32f2f;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 300px;
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
}

.result-text {
  font-size: 1.5em;
  font-weight: bold;
  margin: 20px 0;
  color: #2c3e50;
}

.modal-close-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.3s;
}

.modal-close-btn:hover {
  background: #369b6e;
}
</style>