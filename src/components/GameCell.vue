<template>
  <div class="cell" @click="$emit('click')">
    <transition name="disc-pop">
      <div v-if="disc === 1" class="disc black"></div>
      <div v-else-if="disc === -1" class="disc white"></div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  disc: {
    type: Number,
    required: true
  }
});

defineEmits(['click']);
</script>

<style scoped>
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
  background: rgba(255, 255, 255, 0.1);
}

.disc {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
}

.black {
  background: radial-gradient(circle at 30% 30%, #444, #111);
}

.white {
  background: radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0);
}

/* 石が現れるときのアニメーション */
.disc-pop-enter-active {
  animation: appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes appear {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
