<template>
  <div class="game-container">
    <h1 class="game-title">Othello Game</h1>
    
    <!-- 盤面コンポーネント -->
    <GameBoard 
      :cells="cells" 
      @cell-click="handleClick" 
    />
    
    <!-- 操作パネル -->
    <div class="control-panel">
      <button class="control-btn" @click="restart">リスタート</button>
      <button class="control-btn" @click="handlePass">パス</button>
    </div>

    <!-- メッセージエリア -->
    <div class="message-area">{{ gameMessage }}</div>

    <!-- 結果表示モーダル -->
    <GameModal 
      :show="showResultModal" 
      title="Game Results"
      primaryButtonText="もう一度遊ぶ"
      @close="showResultModal = false"
      @primary-action="restart"
    >
      <p class="result-text">{{ resultText }}</p>
    </GameModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import GameBoard from './GameBoard.vue';
import GameModal from './GameModal.vue';

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
  const nextColor = myStoneColor.value === BLACK ? WHITE : BLACK;
  const nextRivalColor = myStoneColor.value === BLACK ? BLACK : WHITE;
  
  myStoneColor.value = nextColor;
  rivalStoneColor.value = nextRivalColor;

  if (!hasEmptyCell.value) {
    setTimeout(finish, 100);
    return;
  }

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

<style scoped>
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

.message-area {
  margin-top: 10px;
  height: 24px;
  color: #d32f2f;
  font-weight: bold;
}

.result-text {
  font-size: 1.5em;
  font-weight: bold;
  margin: 20px 0;
  color: #2c3e50;
}
</style>
