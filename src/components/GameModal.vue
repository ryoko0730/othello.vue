<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>{{ title }}</h2>
      <slot></slot> <!-- ここに中身（You Win!など）が入る -->
      <button class="modal-close-btn" @click="$emit('primary-action')">
        {{ primaryButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  primaryButtonText: {
    type: String,
    default: 'OK'
  }
});

defineEmits(['close', 'primary-action']);
</script>

<style scoped>
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
