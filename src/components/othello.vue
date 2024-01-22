<template>
  <div class="othelloBoard">
    <div class="container">
      <div class="board">
        <tr v-for="cell in cells" :key="cell">
          <div ></div>
        </tr>
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

}
}
}
</script>

<style>
.othelloBoard {
  align-content: center;
  display: inline-block;
}

.container {
  display: flex;
  align-items: center;
  width: 430px;
  height: 470px;
  background: #333;
}

.board {
  display: flex;
  align-items: center;
  border: #333;
  border-collapse:collapse;
  width: 408px;
  height: 408px;
  background: darkgreen;
}

.cell {
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
