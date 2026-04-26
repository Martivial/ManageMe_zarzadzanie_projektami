<template>
  <div class="modal d-block bg-dark bg-opacity-50">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content p-3">

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Zadania dla: {{ story?.name }}</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" @click="showForm = true">+ Add Task</button>
            <button class="btn btn-secondary btn-sm" @click="$emit('close')">X</button>
          </div>
        </div>

        <!-- FORM -->
        <form v-if="showForm" class="card p-2 mb-3" @submit.prevent="createTask">

          <input v-model="name" class="form-control mb-2" placeholder="Nazwa" />
          <input v-model="description" class="form-control mb-2" placeholder="Opis" />

          <select v-model="priority" class="form-control mb-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select v-model="status" class="form-control mb-2">
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>

          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm" type="submit">
              {{ editingTaskId ? "Update" : "Create" }}
            </button>
            <button class="btn btn-secondary btn-sm" type="button" @click="showForm = false">
              Anuluj
            </button>
          </div>

        </form>

        <!-- KANBAN -->
        <div class="row mt-2">

          <div class="col">
            <h6>TODO</h6>
            <div
              v-for="t in todo"
              :key="t.id"
              class="card p-2 mb-2"
              @click="openTaskDetails(t)"
            >
              <b>{{ t.name }}</b>
              <div class="text-muted small">{{ t.description }}</div>
            </div>
          </div>

          <div class="col">
            <h6>DOING</h6>
            <div
              v-for="t in doing"
              :key="t.id"
              class="card p-2 mb-2"
              @click="openTaskDetails(t)"
            >
              <b>{{ t.name }}</b>
              <div class="text-muted small">{{ t.description }}</div>
            </div>
          </div>

          <div class="col">
            <h6>DONE</h6>
            <div
              v-for="t in done"
              :key="t.id"
              class="card p-2 mb-2"
              @click="openTaskDetails(t)"
            >
              <b>{{ t.name }}</b>
              <div class="text-muted small">{{ t.description }}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>

  <!-- TASK DETAILS MODAL -->
  <TaskDetailsModal
    v-if="showDetails"
    :task="selectedTask"
    @close="showDetails = false"
    @updated="reloadTasks"
  />
</template>

<script setup lang="ts">
import type { Story, Task } from "../models/project"
import { ref, computed, onMounted } from "vue"
import { taskApi } from "../services/taskApi"
import TaskDetailsModal from "./TaskDetailsModal.vue"

const props = defineProps<{ story: Story | null }>()

const tasks = ref<Task[]>([])

const showForm = ref(false)
const showDetails = ref(false)

const editingTaskId = ref<string | null>(null)
const selectedTask = ref<Task | null>(null)

const name = ref("")
const description = ref("")
const priority = ref<"low" | "medium" | "high">("low")
const status = ref<"todo" | "doing" | "done">("todo")

onMounted(() => {
  if (props.story) reloadTasks()
})

function reloadTasks() {
  tasks.value = taskApi.getAll().filter(t => t.storyId === props.story!.id)
}

/* KANBAN */
const todo = computed(() => tasks.value.filter(t => t.status === "todo"))
const doing = computed(() => tasks.value.filter(t => t.status === "doing"))
const done = computed(() => tasks.value.filter(t => t.status === "done"))

/* CREATE + UPDATE */
function createTask() {
  if (!props.story) return
  if (!name.value || !description.value) return

  const task = {
    id: editingTaskId.value ?? String(Date.now()),
    name: name.value,
    description: description.value,
    priority: priority.value,
    status: status.value,
    storyId: props.story.id,
    projectId: props.story.projectId,
    createdAt: new Date().toISOString()
  }

  if (editingTaskId.value) {
    taskApi.update(task)
  } else {
    taskApi.create(task)
  }

  resetForm()
  reloadTasks()
}

/* EDIT */
function editTask(task: Task) {
  editingTaskId.value = task.id
  name.value = task.name
  description.value = task.description
  priority.value = task.priority
  status.value = task.status
  showForm.value = true
}

/* OPEN DETAILS MODAL */
function openTaskDetails(task: Task) {
  selectedTask.value = task
  showDetails.value = true
}

/* RESET */
function resetForm() {
  editingTaskId.value = null
  showForm.value = false
  name.value = ""
  description.value = ""
  priority.value = "low"
  status.value = "todo"
}
</script>