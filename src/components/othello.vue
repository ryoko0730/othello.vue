<template>
  <div class="game-container">
    <h1 class="game-title">Othello Game</h1>
    <div class="othelloBoard">
      <div class="container">
        <div class="board">
          <div v-for="(cell, columnIndex) in cells" :key="columnIndex">
            <div v-for="(disc, rowIndex) in cell" :key="rowIndex" class="cell" @click="clickCell(columnIndex, rowIndex)">
              <div v-if="disc===1" class="disc black" ></div>
              <div v-else-if="disc===-1" class="disc white"></div>
              <div v-if="disc===0" class="disc none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="control-panel">
      <button class="control-btn" @click="restart()">
        リスタート
      </button>
      <button class="control-btn" @click="pass()">
        パス
      </button>
    </div>

    <div class="message-area">
      {{ gameMessage }}
    </div>

    <!-- 結果表示用ダイアログ -->
    <div v-if="showResultModal" class="modal-overlay" @click="showResultModal = false">
      <div class="modal-content" @click.stop>
        <h2>Game Results</h2>
        <p class="result-text">{{ resultText }}</p>
        <button class="modal-close-btn" @click="restart()">もう一度遊ぶ</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'othelloGame',
  props: {
    msg: String
  },
  data: function() {
    return {
      cells: [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,1,-1,0,0,0],
        [0,0,0,-1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
      ],
      direction: [
        [-1, -1],
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0]
      ],
      turnAbleCells: [],
      blackStone: 1,
      whiteStone: -1,
      blankCell: 0,
      checkColumn: '',
      checkRow: '',
      checkStoneColorArray: [],
      checkStoneColorCoordinatesArray: [],
      myStoneColor: 1,
      rivalStoneColor: -1,
      passFlg: false,
      passCount: 0,
      cpuTurnFlg: false,
      gameMessage: '',
      showResultModal: false,
      resultText: ''
    }
  },
  methods: {
    /**
     * マスのクリック
     * 
     * クリックされたマスに、すでに黒い石が置かれているかを確認して、
     * 置かれていなければ、黒い石を置く。
     * 
     * @param columnIndex 縦の座標点
     * @param rowIndex 横の座標点
     */
    clickCell(columnIndex, rowIndex) {
      // 置こうとしている場所が空いていない場合、または相手の石をひっくり返せない場合は配置不可
      if(!this.checkAbleToPut(columnIndex, rowIndex)) {
        return
      } 
      this.checkCell(columnIndex, rowIndex);
    },

    /**
     * 試合を最初から始める
     * 全ての石をリセットして初期配置に戻す
     */
    restart() {
      Object.assign(this.$data, this.$options.data())
    },

    /**
     * 選手交代時に利用するものだけ初期値に戻す
     */
    resetFlg() {
      var defaultFlg = this.$options.data();

      this.cpuFlg = defaultFlg.cpuFlg;
      this.myStoneColor = defaultFlg.myStoneColor;
      this.rivalStoneColor = defaultFlg.rivalStoneColor;
    },

    /**
     * パスする
     */
    pass() {
      const player = this.myStoneColor === this.blackStone ? "あなた" : "CPU";
      this.gameMessage = `${player}は置ける場所がないため、スキップします。`;
      this.passCount ++;
      setTimeout(() => {
        this.changeTurn();
      }, 1000); // 1秒表示してから交代
    },

    /**
     * ひっくり返す石を確認
     * 
     * クリックされたマスの縦列・横列を見て、ひっくり返す石を確認する。
     * 
     * @param columnIndex 縦の座標点
     * @param rowIndex 横の座標点
     */
    checkCell(columnIndex, rowIndex) {
      this.gameMessage = ""; // メッセージをクリア
      this.direction.forEach(dir => {
        this.checkStoneColorArray.splice(0, this.checkStoneColorArray.length);
        this.checkStoneColorCoordinatesArray.splice(0, this.checkStoneColorCoordinatesArray.length);
        this.checkColumn = columnIndex + dir[0];
        this.checkRow = rowIndex + dir[1];

        while (this.checkBoardEnd(this.checkColumn, this.checkRow)) {
          this.checkStoneColorArray.push(this.cells[this.checkColumn][this.checkRow])
          this.checkStoneColorCoordinatesArray.push([this.checkColumn, this.checkRow])
          this.checkColumn = this.checkColumn + dir[0]
          this.checkRow = this.checkRow + dir[1]
        }
        this.turnCells(this.checkStoneColorArray, this.checkStoneColorCoordinatesArray, columnIndex, rowIndex);
      })
      this.passCount = 0; // 石を置いたのでパス回数をリセット
      this.changeTurn();
    },

    /**
     * マスに置かれた石をひっくり返す
     * クリックされたマスをスタートに1列分のマスの中身を受け取り
     * 一番最初に黒い石が置かれた箇所までひっくり返す。
     * 
     * @param checkStoneColorArray 1列分のマスの中身
     * @param checkStoneColorCoordinatesArray 1列分のマスの座標
     * @param columnIndex 縦の座標点
     * @param rowIndex 横の座標点
     */
    turnCells(checkStoneColorArray, checkStoneColorCoordinatesArray, columnIndex, rowIndex) {
      // 自分の石が現れるまでの位置を探す
      const turnNumber = checkStoneColorArray.indexOf(this.myStoneColor);
      
      // 1. 自分の石が見つからない(-1)
      // 2. すぐ隣が自分の石(0)
      // 3. 自分の石が見つかる前に空マス(0)がある
      const emptyCellIndex = checkStoneColorArray.indexOf(this.blankCell);
      if (turnNumber <= 0 || (emptyCellIndex !== -1 && emptyCellIndex < turnNumber)) {
        checkStoneColorArray.splice(0, checkStoneColorArray.length);
        checkStoneColorCoordinatesArray.splice(0, checkStoneColorCoordinatesArray.length);
        return
      } else {
        let cellCount = 0;
        checkStoneColorCoordinatesArray.some(coordinate => {
          if (cellCount == turnNumber) {
            return true;
          }
          this.cells[columnIndex][rowIndex] = this.myStoneColor
          let turnColumnIndex = coordinate[0]
          let turnRowIndex = coordinate[1]
          this.cells[turnColumnIndex][turnRowIndex] = this.myStoneColor;
          cellCount = cellCount + 1;
        })
      }
    },

    /**
     * 選手交代をする
     * CPUモードの時はCPUがマスを置く処理を動かし、
     * 対戦モードの時は置く石の色を切り替える。
     * 
     */
    changeTurn () {
      // 石の色を交代
      const nextStoneColor = this.myStoneColor === this.blackStone ? this.whiteStone : this.blackStone;
      const nextRivalColor = this.myStoneColor === this.blackStone ? this.blackStone : this.whiteStone;
      
      this.myStoneColor = nextStoneColor;
      this.rivalStoneColor = nextRivalColor;

      // 盤面に空きがあるか確認
      const hasEmptyCell = this.cells.some(row => row.includes(this.blankCell));
      if (!hasEmptyCell) {
        // 全てのマスが埋まっていれば終了
        setTimeout(() => {
          this.finish();
        }, 100);
        return;
      }

      // 次のプレイヤーが置ける場所があるか確認
      if (!this.hasAnyMove()) {
        if (this.passCount >= 1) {
          // 両者置けないので終了
          setTimeout(() => {
            this.finish();
          }, 100);
          return;
        } else {
          // 置ける場所がないので自動でパス
          this.pass();
          return;
        }
      }

      // CPUなら実行
      if (this.myStoneColor === this.whiteStone) {
        setTimeout(() => {
          this.cpu();
        }, 500); // 少し待ってから打つ
      }
    },

    /**
     * 現在のプレイヤーが置ける場所が1つでもあるか確認する
     */
    hasAnyMove() {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.checkAbleToPut(i, j)) return true;
        }
      }
      return false;
    },

    /**
     * フラグを切り替えて選手交代をする
     */
    changeFlg() {
      this.cpuFlg = false;
      this.myStoneColor = this.whiteStone;
      this.rivalStoneColor = this.blackStone;
    },

    /**
     * CPUの操作
     */
    cpu(){
      this.turnAbleCells = [];
      let maxFlipped = 0;
      let bestMoves = [];

      for (let columnIndex=0; columnIndex<8; columnIndex++) {
        for (let rowIndex=0; rowIndex<8; rowIndex++) {
          const flippedCount = this.countFlippable(columnIndex, rowIndex);
          if (flippedCount > 0) {
            if (flippedCount > maxFlipped) {
              maxFlipped = flippedCount;
              bestMoves = [[columnIndex, rowIndex]];
            } else if (flippedCount === maxFlipped) {
              bestMoves.push([columnIndex, rowIndex]);
            }
          }
        }
      }

      if (bestMoves.length > 0) {
        // 最も多くひっくり返せる場所の中からランダムに選ぶ
        const index = Math.floor(Math.random() * bestMoves.length);
        const [col, row] = bestMoves[index];
        this.checkCell(col, row);
      } else {
        // 置ける場所がないならパス
        this.pass();
      }
    },

    /**
     * 指定したマスに置いたときにひっくり返せる石の総数を数える
     * 
     * @param columnIndex 縦の座標点
     * @param rowIndex 横の座標点
     * @return ひっくり返せる数
     */
    countFlippable(columnIndex, rowIndex) {
      if (this.cells[columnIndex][rowIndex] !== this.blankCell) {
        return 0;
      }

      let totalFlipped = 0;
      this.direction.forEach(dir => {
        let col = columnIndex + dir[0];
        let row = rowIndex + dir[1];
        let flippedInDir = 0;

        // 1つ隣が相手の石でないならその方向は置けない
        if (!this.checkBoardEnd(col, row) || this.cells[col][row] !== this.rivalStoneColor) {
          return;
        }

        while (this.checkBoardEnd(col, row)) {
          if (this.cells[col][row] === this.myStoneColor) {
            totalFlipped += flippedInDir;
            return;
          } else if (this.cells[col][row] === this.blankCell) {
            return;
          }
          // 相手の石ならカウントして先へ
          flippedInDir++;
          col += dir[0];
          row += dir[1];
        }
      });
      return totalFlipped;
    },

    /**
     * ボード上のマスの位置を確認する
     * 9×9のマス上にあればtrueを、そうでなければfalseを返す。
     * 
     * @param columnIndex 縦の座標点
     * @param rowIndex 横の座標点
     */
    checkBoardEnd(columnIndex, rowIndex){
      return (columnIndex >= 0 && columnIndex < 8) && (rowIndex >= 0 && rowIndex < 8);
    },

    /**
     * ボード上に石を置けるマスがあるか確認する
     * すべてのマスに石が置かれていた場合は、ゲームを終了する。
     */
    verification () {
      for (let columnIndex=0; columnIndex<8; columnIndex++) {
        for (let rowIndex=0; rowIndex<8; rowIndex++) {
          if (this.checkAbleToPut(columnIndex, rowIndex)){
            this.turnAbleCells.push([columnIndex, rowIndex]);
          }
        }
      }
      if (this.turnAbleCells.length < 1){
        if (this.passFlg){
          this.finish()
        } else {
          this.passCount ++;
          // パスは3回まで
          if (this.passCount == 3) {
            this.passFlg = true
          }
        }
      }
      this.changeTurn()
    },

    /**
     * 置けるマスかどうかを判定する
     * 
     * @param row 列
     * @param cell マス
     * @return 置けるマス：true 置けないマス：false
     */
    checkAbleToPut(columnIndex, rowIndex) {
      // スタートマスが空でない場合は配置不可
      if (this.cells[columnIndex][rowIndex] !== this.blankCell) {
        return false;
      }

      // 8方向のうち、どこか1方向でもひっくり返せれば配置可能
      return this.direction.some(dir => {
        let col = columnIndex + dir[0];
        let row = rowIndex + dir[1];
        
        // 1つ隣が相手の石ではない場合その方向には配置不可
        if (!this.checkBoardEnd(col, row) || this.cells[col][row] !== this.rivalStoneColor) {
          return false;
        }

        // さらにその先を見ていく
        col += dir[0];
        row += dir[1];
        while (this.checkBoardEnd(col, row)) {
          if (this.cells[col][row] === this.myStoneColor) {
            return true; // 自分の石が1つでもあれば配置可能
          } else if (this.cells[col][row] === this.blankCell) {
            return false; // 空マスの場合は配置不可
          }
          // 相手の石なら配置判定を継続
          col += dir[0];
          row += dir[1];
        }
        return false;
      });
    },

    /**
     * ゲーム終了時点の石の数を数え、勝敗を通知する。
     */
    finish () {
      let blackCount = 0;
      let whiteCount = 0;
      this.cells.forEach(row => {
        row.forEach(cell => {
          if (cell === this.blackStone) blackCount++;
          if (cell === this.whiteStone) whiteCount++;
        });
      });

      if (blackCount > whiteCount) {
        this.resultText = `You Win! (黒: ${blackCount}, 白: ${whiteCount})`;
      } else if (blackCount < whiteCount) {
        this.resultText = `You Lose... (黒: ${blackCount}, 白: ${whiteCount})`;
      } else {
        this.resultText = `Draw! (黒: ${blackCount}, 白: ${whiteCount})`;
      }

      this.showResultModal = true;
    }
  }
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
  background: rgba(255, 255, 255, 0.1); /* マウスホバーで少し明るく */
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

.none {
  background: transparent;
}

.message-area {
  margin-top: 10px;
  height: 24px;
  color: #d32f2f;
  font-weight: bold;
}

/* モーダルのスタイル */
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
