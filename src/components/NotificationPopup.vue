<template>
  <div v-if="notification" class="popup-overlay">
    <div class="popup-card card p-3">

      <div class="d-flex justify-content-between align-items-center">
        <b>{{ notification.title }}</b>

        <button class="btn btn-sm btn-secondary" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div class="mt-2 text-muted">
        {{ notification.message }}
      </div>

      <div class="mt-2">
        <span class="badge"
          :class="{
            'bg-warning text-dark': notification.priority === 'medium',
            'bg-danger': notification.priority === 'high'
          }"
        >
          {{ notification.priority }}
        </span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from "../models/notification"

defineProps<{ notification: Notification | null }>()
defineEmits(["close"])
</script>

<style>
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.popup-card {
  min-width: 300px;
  max-width: 400px;
}
</style>