<template>
  <div class="othelloBoard">
    <div class="container">
      <div class="board">
        <!-- 列 (Columns) -->
        <div v-for="(column, colIndex) in cells" :key="colIndex">
          <!-- マス (Rows) -->
          <GameCell
            v-for="(disc, rowIndex) in column"
            :key="rowIndex"
            :disc="disc"
            @click="$emit('cell-click', colIndex, rowIndex)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GameCell from './GameCell.vue';

defineProps({
  cells: {
    type: Array,
    required: true
  }
});

defineEmits(['cell-click']);
</script>

<style scoped>
.othelloBoard {
  display: inline-block;
  padding: 10px;
  background: #2c3e50;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  margin-bottom: 15px;
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
</style>
