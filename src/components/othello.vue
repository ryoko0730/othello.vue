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
      checkArray: [],
      coordinates: [],
      count: 0,
      turn: 1
    }
  },
  methods: {
    clickCell(columnIndex, rowIndex) {
      if(this.cells[columnIndex][rowIndex] !== this.blankCell) {
        return
      } 
      this.checkCell(columnIndex, rowIndex);
    },
    restart() {
      Object.assign(this.$data, this.$options.data())
    },
    checkCell(columnIndex, rowIndex) {
      this.direction.forEach(dir => {
        this.checkArray.splice(0, this.checkArray.length);
        this.coordinates.splice(0, this.coordinates.length);
        this.checkColumn = columnIndex + dir[0];
        this.checkRow = rowIndex + dir[1];

        while (this.checkBoardEnd(this.checkColumn, this.checkRow)) {
          this.checkArray.push(this.cells[this.checkColumn][this.checkRow])
          this.coordinates.push([this.checkColumn, this.checkRow])
          this.checkColumn = this.checkColumn + dir[0]
          this.checkRow = this.checkRow + dir[1]
        }
        this.turnCells(this.checkArray, this.coordinates, columnIndex, rowIndex);
      })
      this.changeTurn();
    },
    turnCells(checkArray, coordinates, columnIndex, rowIndex) {
      const turnNumber = checkArray.indexOf(this.blackStone);
      if (turnNumber == 0 || turnNumber == -1) {
        checkArray.splice(0, checkArray.length);
        coordinates.splice(0, coordinates.length);
        return
      } else {
        coordinates.forEach(coordinate => {
          if (this.count == turnNumber) {
            checkArray.splice(0, checkArray.length);
            coordinates.splice(0, coordinates.length);
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
    changeTurn () {
      this.turn = 0 - this.turn;
      if(!this.cells.some(cell => cell.some(disc => disc === 0))) {
        this.finish();
      }
      this.verification();
    },
    checkBoardEnd(columnIndex, rowIndex){
      return 8>columnIndex && columnIndex>0 && 8>rowIndex && rowIndex>0;
    },
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
