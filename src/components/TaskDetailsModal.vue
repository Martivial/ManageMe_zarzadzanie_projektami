<template>
  <div class="modal d-block bg-dark bg-opacity-50">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content p-3">

        <h5>{{ task?.name }}</h5>

        <div v-if="task">
          <div>Opis: {{ task.description }}</div>
          <div>Przypisana historyjka {{ getStoryName(task.storyId) }}</div>
          <div>Priorytet: {{ task.priority }}</div>
          <div>Status: {{ task.status }}</div>
          <div>Data startu {{ formatDate(task.startAt) }}</div>
          <div>Koniec: {{ formatDate(task.endAt) }}</div>
          <div>Przypisana osoba: {{ getUserName(task?.assignedUserId) }}</div>
          <div>Szacowane godziny: {{ task.estimatedHours }}</div>
        </div>

        <hr>

        <div v-if="task?.status === 'todo'">
          <h6>Przypisz osobę</h6>

          <div class="input-group input-group-sm w-75">
            <select v-model="selectedUserId" class="form-select form-select-sm">
              <option v-for="u in users.filter(u => u.role !== 'admin')" :key="u.id" :value="u.id">
                {{ u.firstName }} {{ u.lastName }} {{ u.role }}
              </option>
            </select>

            <button class="btn btn-primary" @click="assignUser">Przypisz</button>
          </div>
        </div>

        <button
          v-if="task?.status === 'doing'"
          @click="markDone"
          class="btn btn-success btn-sm me-2"
        >
          Zaznacz wykonanie zadania
        </button>

        <button @click="$emit('close')" class="btn btn-danger btn-sm mt-2">
          Zamknij
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../models/project"
import type { User } from "../models/user"
import { userApi } from "../services/userApi"
import { ref } from "vue"
import { storyApi } from "../services/storyApi"
import { projectApi } from "../services/projectApi"
import { taskApi } from "../services/taskApi"
import { notificationApi } from "../services/notificationApi"

const props = defineProps<{ task: Task | null }>()
const emit = defineEmits(["updated", "close"])

const users: User[] = userApi.getAll()
const selectedUserId = ref<number | null>(null)

function getStoryName(id: string) {
  return storyApi.getAll().find(s => s.id === id)?.name || "-"
}

function getUserName(id?: number) {
  const user = users.find(u => u.id === id)
  return user ? `${user.firstName} ${user.lastName} ${user.role}` : "-"
}

function formatDate(date?: string) {
  if (!date) return "-"
  return new Date(date).toLocaleString("pl-PL")
}


function notifyStatusChange(oldTask: Task, newTask: Task) {
  if (oldTask.status === newTask.status) return
  if (!props.task?.storyId) return

  const story = storyApi.getAll().find(s => s.id === props.task!.storyId)
  const project = projectApi.getAll().find(p => p.id === story?.projectId)
  if (!story?.ownerId) return

  let prio: "low" | "medium" | "high" = "low"
  if (newTask.status === "done") prio = "medium"
  if (newTask.status === "doing") prio = "low"

  notificationApi.create({
    id: String(Date.now() + Math.random()),
    title: "Zmiana statusu zadania",
    message: `Projekt: ${project?.name ?? "-"} | Historyjka: ${story?.name ?? "-"} | Zadanie: ${newTask.name} | status: ${newTask.status}`,
    date: new Date().toISOString(),
    priority: prio,
    isRead: false,
    recipientId: story.ownerId,
    type: "task",
    relatedId: newTask.id
  })

  window.dispatchEvent(new Event("notifications-updated"))
}


function assignUser() {
  if (!props.task) return
  if (props.task.status !== "todo") return

  const oldTask = { ...props.task }
  const assignedUserId = selectedUserId.value ?? undefined

  props.task.assignedUserId = assignedUserId
  props.task.status = "doing"
  props.task.startAt = new Date().toISOString()

  taskApi.update(props.task)

  notifyStatusChange(oldTask, props.task)

  const story = storyApi.getAll().find(s => s.id === props.task!.storyId)
  const project = projectApi.getAll().find(p => p.id === story?.projectId)

  if (story && story.status === "todo") {
    story.status = "doing"
    storyApi.update(story)
  }

  if (assignedUserId) {
    notificationApi.create({
      id: String(Date.now() + Math.random()),
      title: "Zostałeś przypisany do zadania",
      message: `Nowe zadanie w projekcie "${project?.name ?? "-"}" w historyjce "${story?.name ?? "-"}" nazwa zadania "${props.task.name}"`,
      date: new Date().toISOString(),
      priority: "medium",
      isRead: false,
      recipientId: assignedUserId,
      type: "task",
      relatedId: props.task.id
    })

    window.dispatchEvent(new Event("notifications-updated"))
  }

  emit("updated")
}

function markDone() {
  if (!props.task) return

  const oldTask = { ...props.task }

  props.task.status = "done"
  props.task.endAt = new Date().toISOString()

  taskApi.update(props.task)

  notifyStatusChange(oldTask, props.task)

  const story = storyApi.getAll().find(s => s.id === props.task!.storyId)

  if (story) {
    const allTasks = taskApi.getAll().filter(t => t.storyId === story.id)
    const allDone = allTasks.every(t => t.status === "done")

    if (allDone) {
      story.status = "done"
      storyApi.update(story)
    }
  }

  emit("updated")
}
</script>