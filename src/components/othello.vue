<template>
  <div class="othelloBoard">
    <div class="container">
      <div class="board">
        <div v-for="cell in cells" :key="cell">
          <div v-for="disc in cell" :key="disc" class="cell" @click="clickCell(disc)">
            <div v-if="disc===1" class="disc black"></div>
            <div v-else-if="disc===-1" class="disc white"></div>
            <div v-if="disc===0"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
    clickCell(disc){
      // disc = disc || window.event;
      // element = disc.target;
      // let list_tr = document.getElementsByTagName("tr");
      // let list_td = element.parentNode.childNpdes;
      // list_tr = [].slice.call(list_tr);
      // list_td = [].slice.call(list_td);
      // console.log(list_tr);
      // console.log(list_td);
      // tr_num = list_tr.indexOf(element.parentNode);
      // td_num = list_td.indexOf(element);
      // console.log(tr_num);
      // console.log(td_num);
      // this.put(tr_num, td_num)
      // this.$set(this.cells, disc, 1)
      console.log(disc);
      this.disc = 1;
      console.log(disc);
      return disc
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
