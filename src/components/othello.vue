<template>
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
  <div>
    <button @click="restart()">
      リスタート
    </button>
    <button @click="pass()">
      パス
    </button>
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
      cpuTurnFlg: false
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
      this.passCount ++;
      this.changeTurn();
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

      // CPUなら実行
      if (this.myStoneColor === this.whiteStone) {
        setTimeout(() => {
          this.cpu();
        }, 500); // 少し待ってから打つ
      }
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
        document.getElementById("message").innerHTML = "置ける場所がありません";
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
      const sum = this.cells.reduce((cellSum, cell) => cellSum + cell.reduce((discSum, disc) => discSum + disc, 0), 0)
      if (sum > 0){
        document.getElementById("message").innerHTML = "黒の勝ちです";
      } else if (sum < 0){
        document.getElementById("message").innerHTML = "白の勝ちです";
      } else {
        document.getElementById("message").innerHTML = "引き分けです";
      }
    }
  }
}
</script>

<style>
.othelloBoard {
  display: inline-block;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 430px;
  height: 470px;
  background: #333;
}

.board {
  display: flex;
  border: #333;
  border-collapse:collapse;
  width: 411px;
  height: 397px;
  background: darkgreen;
}

.cell {
  border: solid;
  border-width: thin;
  display: flex;
  justify-content: center;
  align-items: center;
  table-layout: fixed;
  width: 50px;
  height: 48px;
}

.disc {
  width: 85%;
  height: 85%;
  border-radius: 50%;
}

.white {
  background: #eee;
}

.black {
  background: #333;
}
</style>
