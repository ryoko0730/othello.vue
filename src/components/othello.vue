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
      restart
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
      turnAbleCells: [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
      ],
      blackStone: 1,
      whiteStone: -1,
      blankCell: 0,
      checkColumn: '',
      checkRow: '',
      checkStoneColorArray: [],
      checkStoneColorCoordinatesArray: [],
      count: 0,
      turn: 1
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
      if(this.cells[columnIndex][rowIndex] !== this.blankCell) {
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
      const turnNumber = checkStoneColorArray.indexOf(this.blackStone);
      if (turnNumber == 0 || turnNumber == -1) {
        checkStoneColorArray.splice(0, checkStoneColorArray.length);
        checkStoneColorCoordinatesArray.splice(0, checkStoneColorCoordinatesArray.length);
        return
      } else {
        checkStoneColorCoordinatesArray.forEach(coordinate => {
          if (this.count == turnNumber) {
            checkStoneColorArray.splice(0, checkStoneColorArray.length);
            checkStoneColorCoordinatesArray.splice(0, checkStoneColorCoordinatesArray.length);
            return
          }
          this.cells[columnIndex][rowIndex] = this.blackStone
          let turnColumnIndex = coordinate[0]
          let turnRowIndex = coordinate[1]
          this.cells[turnColumnIndex][turnRowIndex] = this.blackStone;
          this.count = this.count + 1;
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
      this.turn = 0 - this.turn;
      if(!this.cells.some(cell => cell.some(disc => disc === 0))) {
        this.finish();
      }
      this.verification();
    },

    /**
     * ボード上のマスの位置を確認する
     * 9×9のマス上にあればtrueを、そうでなければfalseを返す。
     * 
     * @param columnIndex 縦の座標点
     * @param rowIndex 横の座標点
     */
    checkBoardEnd(columnIndex, rowIndex){
      return (8 > columnIndex && columnIndex > 0) && (8 > rowIndex && rowIndex > 0);
    },

    /**
     * ボード上に石を置けるマスがあるか確認する
     * また、すべてのマスに石が置かれていた場合は、ゲームを終了する。
     */
    verification () {
      for (let i=0; i<8; i++) {
        for (let j=0; j<8; j++) {
          if (this.checkAbleToPut(i, j)){
            this.turnAbleCells.push([i, j]);
          }
        }
      }
      if (this.turnAbleCells.length === 0){
        document.getElementById("message").innerHTML = "置ける場所がありません";
        if (this.flag_pass){
          this.finish()
        } else {
        this.flag_pass = true
        this.change_turn()
        }
      } else {
        this.flag_pass = false
        if (this.flag_vscpu === "cpu" & this.turn === this.random){
          let random_choice = this.turnAbleCells[Math.floor(Math.random() * this.turnAbleCells.length)];
          setTimeout(this.put, 1000, random_choice[0], random_choice[1]);
        }
      }
    },

    /**
     * 置けるマスがあるかどうかを判定する
     * 
     * @param row 列
     * @param cell マス
     * @return 置けるマス：true 置けないマス：false
     */
    checkAbleToPut() {

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
