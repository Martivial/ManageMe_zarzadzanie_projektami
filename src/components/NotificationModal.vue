<template>
  <div class="modal d-block">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content p-3">

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Powiadomienia</h5>

          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-sm btn-outline-secondary" @click="showUnreadOnly = !showUnreadOnly">
              {{ showUnreadOnly ? "Wszystkie" : "Nieprzeczytane" }}
            </button>

            <button class="btn btn-sm btn-secondary" @click="$emit('close')">
              Zamknij
            </button>
          </div>
        </div>

        <div v-if="!showDetail">

        <div v-for="n in filteredNotifications" :key="n.id" class="card p-2 mb-2" :class="{ 'opacity-50': n.isRead }" @click="openDetail(n)">
          <div class="d-flex justify-content-between">

            <div>
              <b>
                {{ n.title }}
                <span v-if="n.isRead" class="text-danger small ms-2">przeczytane</span>
              </b>

              <div class="small text-muted">
                {{ n.message }}
              </div>
            </div>

            <span class="badge"
              :class="{
                'bg-success': n.priority === 'low',
                'bg-warning text-dark': n.priority === 'medium',
                'bg-danger': n.priority === 'high'
              }"
            >
              {{ n.priority }}
            </span>

          </div>

          <div class="small text-muted mt-2">
            {{ new Date(n.date).toLocaleString("pl-PL") }}
          </div>

          <button  v-if="!n.isRead" class="btn btn-sm btn-outline-success mt-2"@click="markRead(n.id)">
            Oznacz jako przeczytane
          </button>

        </div>

        <div v-if="filteredNotifications.length === 0" class="text-center text-muted">
          Brak powiadomień
        </div>

        </div>

        <div v-else class="p-2">

          <button class="btn btn-sm btn-secondary mb-3" @click="showDetail = false">
            ← Wróć
          </button>

          <h5>{{ selected.title }}</h5>

          <div class="small text-muted mb-2">
            {{ selected.message }}
          </div>

          <span class="badge"
            :class="{
              'bg-success': selected.priority === 'low',
              'bg-warning text-dark': selected.priority === 'medium',
              'bg-danger': selected.priority === 'high'
            }"
          >
            {{ selected.priority }}
          </span>

          <div class="small text-muted mt-3">
            {{ new Date(selected.date).toLocaleString("pl-PL") }}
          </div>

          <div v-if="selected.isRead" class="text-danger small mt-2">
            przeczytane
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from "../models/notification"
import { notificationApi } from "../services/notificationApi"
import { computed, ref } from "vue"

const props = defineProps<{ notifications: Notification[] }>()
const emit = defineEmits(["close", "refresh"])

const selected = ref<any>(null)
const showDetail = ref(false)
const showUnreadOnly = ref(false)

const filteredNotifications = computed(() =>
  showUnreadOnly.value
    ? props.notifications.filter(n => !n.isRead)
    : props.notifications
)

function markRead(id: string) {
  notificationApi.markAsRead(id)
  emit("refresh")
}

function openDetail(n: Notification) {
  selected.value = n
  showDetail.value = true
  notificationApi.markAsRead(n.id)
  emit("refresh")
}
</script>

<style>
.modal-dialog {
  max-height: 90vh;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto !important;
}
</style>