<template>
  <div class="othelloBoard">
    <div class="container">
      <div class="board">
        <div v-for="cell in cells" :key="cell">
          <div v-for="stone in cells" :key="stone" class="cell" v-on="clickCell()">
            <div v-if="stone===1" class="disc black"></div>
            <div v-if="stone===-1" class="disc white"></div>
            <div v-if="stone===0"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div><button @click="restart()"></button></div>
</template>

<script>
export default {
  name: 'HelloWorld',
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
      ]
    }
  },
  methods: {
    restart() {

    },
    clickCell(){

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
