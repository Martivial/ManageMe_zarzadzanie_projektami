<template>
  <div class="modal d-block bg-dark bg-opacity-50">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content p-3">

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Zadania dla: {{ story?.name }}</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" @click="showForm = true">+ Dodaj zadanie</button>
            <button class="btn btn-secondary btn-sm" @click="$emit('close')">X</button>
          </div>
        </div>

        <form v-if="showForm" class="card p-2 mb-3" @submit.prevent="createTask">

          <input v-model="name" class="form-control mb-2" placeholder="Nazwa" required />
          <input v-model="description" class="form-control mb-2" placeholder="Opis" required />

          <div class="d-flex align-items-center gap-2 mb-2">
            <label>Przewidywany czas wykonania:</label>
            <input v-model.number="estimatedHours" type="number" min="0" class="form-control" style="max-width:80px">
            <span>godzin</span>
          </div>

          <div class="d-flex align-items-center gap-2 mb-2">
            <label>Wybierz priorytet:</label>
            <select v-model="priority" class="form-select w-auto">
              <option value="low">Niski</option>
              <option value="medium">Średni</option>
              <option value="high">Wysoki</option>
            </select>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm" type="submit">
              {{ editingTaskId ? "Edytuj" : "Stwórz" }}
            </button>
            <button class="btn btn-secondary btn-sm" type="button" @click="showForm = false; resetForm()">
              Anuluj
            </button>
          </div>

        </form>

        <div class="row mt-2">

          <div class="col border-end border-1 border-secondary">
            <h6 class="text-center">TODO</h6>

            <div v-for="t in todo" :key="t.id"
                 class="card p-2 mb-2"
                 @click="!editingTaskId && openTaskDetails(t)">

              <div class="d-flex gap-2 justify-content-between">
                <div>
                  <b>
                    {{ t.name }}
                    <span class="badge ms-1"
                      :class="{
                        'bg-success text-white': t.priority === 'low',
                        'bg-warning text-dark': t.priority === 'medium',
                        'bg-danger text-white': t.priority === 'high'
                      }">
                      {{ getPrio(t.priority) }}
                    </span>
                  </b>
                  <div class="text-muted small pb-1">{{ t.description }}</div>
                </div>

                <div>
                  <i class="bi bi-pencil me-1" @click.stop="editTask(t)"></i>
                  <i class="bi bi-trash text-danger" @click.stop="deleteTask(t.id)"></i>
                </div>
              </div>

              <div class="text-muted small">Stworzono: {{ formateDate(t.createdAt) }}</div>
              <div class="text-muted small">Przewidywany czas wykonania: {{ t.estimatedHours }}h</div>

            </div>
          </div>

          <div class="col border-end border-1 border-secondary">
            <h6 class="text-center">DOING</h6>

            <div v-for="t in doing" :key="t.id"
                 class="card p-2 mb-2"
                 @click="!editingTaskId && openTaskDetails(t)">

              <div class="d-flex gap-2 justify-content-between">
                <div>
                  <b>
                    {{ t.name }}
                    <span class="badge ms-1"
                      :class="{
                        'bg-success text-white': t.priority === 'low',
                        'bg-warning text-dark': t.priority === 'medium',
                        'bg-danger text-white': t.priority === 'high'
                      }">
                      {{ getPrio(t.priority) }}
                    </span>
                  </b>
                  <div class="text-muted small pb-1">{{ t.description }}</div>
                </div>

                <div>
                  <i class="bi bi-pencil me-1" @click.stop="editTask(t)"></i>
                  <i class="bi bi-trash text-danger" @click.stop="deleteTask(t.id)"></i>
                </div>
              </div>

              <div class="text-muted small">Stworzono: {{ formateDate(t.createdAt) }}</div>
              <div class="text-muted small">Przypisano: {{ getUserName(t.assignedUserId) }}</div>

            </div>
          </div>

          <div class="col">
            <h6 class="text-center">DONE</h6>

            <div v-for="t in done" :key="t.id"
                 class="card p-2 mb-2"
                 @click="!editingTaskId && openTaskDetails(t)">

              <div class="d-flex gap-2 justify-content-between">
                <div>
                  <b>
                    {{ t.name }}
                    <span class="badge ms-1"
                      :class="{
                        'bg-success text-white': t.priority === 'low',
                        'bg-warning text-dark': t.priority === 'medium',
                        'bg-danger text-white': t.priority === 'high'
                      }">
                      {{ getPrio(t.priority) }}
                    </span>
                  </b>
                  <div class="text-muted small pb-2">{{ t.description }}</div>
                </div>

                <div>
                  <i class="bi bi-pencil me-1" @click.stop="editTask(t)"></i>
                  <i class="bi bi-trash text-danger" @click.stop="deleteTask(t.id)"></i>
                </div>
              </div>

              <div class="text-muted small">Stworzono: {{ formateDate(t.createdAt) }}</div>
              <div class="text-muted small pb-1">Zakończono: {{ formateDate(t.endAt) }}</div>
              <div class="text-muted small">Wykonawca: {{ getUserName(t.assignedUserId) }}</div>

            </div>
          </div>

        </div>

      </div>
    </div>
  </div>

  <TaskDetailsModal v-if="showDetails":task="selectedTask"@close="showDetails = false" @updated="reloadTasks"
  />
</template>

<script setup lang="ts">
import type { Story, Task } from "../models/project"
import { ref, computed, onMounted } from "vue"
import { taskApi } from "../services/taskApi"
import TaskDetailsModal from "./TaskDetailsModal.vue"
import { userApi } from "../services/userApi"
import { notificationApi } from "../services/notificationApi"
import { storyApi } from "../services/storyApi"

const props = defineProps<{ story: Story | null }>()
const emit = defineEmits(["updated", "close"])

const tasks = ref<Task[]>([])

const showForm = ref(false)
const showDetails = ref(false)

const selectedTask = ref<Task | null>(null)

const name = ref("")
const description = ref("")
const priority = ref<"low" | "medium" | "high">("low")
const status = ref<"todo" | "doing" | "done">("todo")
const estimatedHours = ref(0)
const editingTaskId = ref<string | null>(null)

onMounted(() => {
  if (props.story) reloadTasks()
})

function reloadTasks() {
  tasks.value = taskApi.getAll().filter(t => t.storyId === props.story!.id)
  emit("updated")
}

const todo = computed(() => tasks.value.filter(t => t.status === "todo"))
const doing = computed(() => tasks.value.filter(t => t.status === "doing"))
const done = computed(() => tasks.value.filter(t => t.status === "done"))

function createTask() {
  if (!props.story) return
  if (!name.value || !description.value) return

  const currentUserId = Number(localStorage.getItem("currentUserId"))

  const task: Task = {
    id: editingTaskId.value ?? String(Date.now()),
    name: name.value,
    description: description.value,
    priority: priority.value,
    status: status.value,
    storyId: props.story.id,
    projectId: props.story.projectId,
    createdAt: new Date().toISOString(),
    startAt: status.value !== "todo" ? new Date().toISOString() : undefined,
    estimatedHours: estimatedHours.value
  }

  if (editingTaskId.value) {

    const oldTask = tasks.value.find(t => t.id === editingTaskId.value)
    const oldStatus = oldTask?.status

    taskApi.update(task)

    if (oldStatus !== task.status && props.story?.ownerId) {

      let prio: "low" | "medium" | "high" = "low"

      if (task.status === "done") prio = "medium"
      if (task.status === "doing") prio = "low"

      notificationApi.create({
        id: String(Date.now() + Math.random()),
        title: "Zmiana statusu zadania",
        message: `${task.name} → ${task.status}`,
        date: new Date().toISOString(),
        priority: prio,
        isRead: false,
        recipientId: props.story.ownerId,
        type: "task",
        relatedId: task.id
      })

      window.dispatchEvent(new Event("notifications-updated"))
    }

    const story = props.story

    if (story && oldStatus !== task.status) {

      if (story.status === "todo") {
        story.status = "doing"
        storyApi.update(story)
      }

      const storyTasks = taskApi.getAll().filter(t => t.storyId === story.id)
      const allDone = storyTasks.every(t => t.status === "done")

      if (allDone) {
        story.status = "done"
        storyApi.update(story)
      }
    }

  } else {
    taskApi.create(task)

    notificationApi.notifyTaskCreated(
      currentUserId,
      task.name
    )
  }

  reloadTasks()
  resetForm()
}

function resetForm() {
  editingTaskId.value = null
  showForm.value = false
  selectedTask.value = null

  name.value = ""
  description.value = ""
  priority.value = "low"
  estimatedHours.value = 0
  status.value = "todo"
}

function openTaskDetails(task: Task) {
  selectedTask.value = task
  showDetails.value = true
}

function formateDate(date?: string) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("pl-PL")
}

function getPrio(p: string) {
  if (p === "low") return "niski"
  if (p === "medium") return "średni"
  if (p === "high") return "wysoki"
  return "-"
}

function deleteTask(id: string) {
  const task = tasks.value.find(t => t.id === id)

  taskApi.remove(id)

  const currentUserId = Number(localStorage.getItem("currentUserId"))

  if (task) {
    notificationApi.notifyTaskDeleted(currentUserId, task.name)
  }

  reloadTasks()
}

function editTask(task: Task) {
  selectedTask.value = null
  showDetails.value = false

  editingTaskId.value = task.id
  showForm.value = true

  name.value = task.name
  description.value = task.description
  priority.value = task.priority
  estimatedHours.value = task.estimatedHours
  status.value = task.status
}

function getUserName(id?: number) {
  if (!id) return "-"
  const user = userApi.getById(id)
  return user ? `${user.firstName} ${user.lastName}` : "-"
}
</script>