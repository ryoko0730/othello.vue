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
      rivalStoneColor: 0,
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
      this.cpuFlg = true;
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
        let cellCount = 0;
        checkStoneColorCoordinatesArray.some(coordinate => {
          if (cellCount == turnNumber) {
            checkStoneColorArray.splice(0, checkStoneColorArray.length);
            checkStoneColorCoordinatesArray.splice(0, checkStoneColorCoordinatesArray.length);
            return false;
          }
          this.cells[columnIndex][rowIndex] = this.blackStone
          let turnColumnIndex = coordinate[0]
          let turnRowIndex = coordinate[1]
          this.cells[turnColumnIndex][turnRowIndex] = this.blackStone;
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
      if (this.cpuFlg) {
        this.changeFlg();
        this.cpu();
        this.resetFlg();
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
      this.verification();
      // ひっくりかえせる数が最も多いものを選んで石を置く
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
      // スタートマスが空でない場合は置けないので早期リターン
      if (this.cells[columnIndex][rowIndex] !== this.blankCell) {
        return false;
      }
      var canPlace = this.direction.some(dir => {
      this.checkColumn = columnIndex + dir[0];
      this.checkRow = rowIndex + dir[1];
      while (this.checkBoardEnd(this.checkColumn, this.checkRow)) {
        // チェック方向の1つ目のマスが相手の石でない場合はひっくりかえせないのでリターン
        if (this.cells[this.checkColumn][this.checkRow] !== this.rivalStoneColor) {
          return false;
        }
        this.checkColumn = this.checkColumn + dir[0]
        this.checkRow = this.checkRow + dir[1]
        switch (this.cells[this.checkColumn][this.checkRow]) {
          case this.blankCell:
            return false;
          case this.blackStone:
            return true;
        }
      }
      })
      return canPlace;
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
