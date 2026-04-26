<template>
  <div class="modal d-block bg-dark bg-opacity-50">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content p-3">

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">{{ localTask?.name }}</h5>
          <button class="btn btn-secondary btn-sm" @click="$emit('close')">X</button>
        </div>

        <div v-if="localTask">

          <div class="mb-2"><b>Opis:</b> {{ localTask.description }}</div>
          <div class="mb-2"><b>Priorytet:</b> {{ localTask.priority }}</div>
          <div class="mb-2"><b>Status:</b> {{ localTask.status }}</div>

          <div class="mb-2"><b>Story ID:</b> {{ localTask.storyId }}</div>

          <div class="mb-2"><b>Start:</b> {{ localTask.startAt ?? "-" }}</div>
          <div class="mb-2"><b>End:</b> {{ localTask.endAt ?? "-" }}</div>

          <hr />

          <!-- USER ASSIGN -->
          <label class="mb-1">Przypisana osoba</label>
          <select v-model="localTask.assignedUserId" class="form-control mb-2">
            <option value="">-- brak --</option>
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.firstName }} {{ u.lastName }} ({{ u.role }})
            </option>
          </select>

          <button class="btn btn-primary btn-sm mb-3" @click="assignUser">
            Przypisz osobę
          </button>

          <hr />

          <!-- CURRENT USER -->
          <div class="mb-2">
            <b>Aktualny user:</b>
            <span v-if="getUserById(localTask.assignedUserId)">
              {{ getUserById(localTask.assignedUserId)?.firstName }}
              {{ getUserById(localTask.assignedUserId)?.lastName }}
              ({{ getUserById(localTask.assignedUserId)?.role }})
            </span>
            <span v-else>-</span>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../models/project"
import type { User } from "../models/user"

import { ref, watch } from "vue"
import { taskApi } from "../services/taskApi"
import { userApi } from "../services/userApi"

const props = defineProps<{ task: Task | null }>()
const emit = defineEmits(["close", "updated"])

/* USERS z API */
const users: User[] = userApi.getAll()

/* lokalna kopia taska */
const localTask = ref<Task | null>(null)

/* kopiowanie props → local */
watch(
  () => props.task,
  (t) => {
    if (t) {
      localTask.value = { ...t }
    }
  },
  { immediate: true }
)

/* helper */
function getUserById(id?: string) {
  return users.find(u => u.id === id)
}

/* LOGIKA PRZYPISANIA USERA */
function assignUser() {
  if (!localTask.value) return

  if (!localTask.value.assignedUserId) return

  // jeśli pierwszy raz przypisanie → start taska
  if (localTask.value.status === "todo") {
    localTask.value.status = "doing"
  }

  if (!localTask.value.startAt) {
    localTask.value.startAt = new Date().toISOString()
  }

  taskApi.update(localTask.value)

  emit("updated")
}
</script>