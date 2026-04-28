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

          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm" type="submit">Create</button>
            <button class="btn btn-secondary btn-sm" type="button" @click="showForm = false">Anuluj</button>
          </div>

        </form>

        <!-- KANBAN -->
        <div class="row mt-2">

          <div class="col">
            <h6>TODO</h6>
            <div v-for="t in todo" :key="t.id" class="card p-2 mb-2" @click="openTaskDetails(t)">
              <b>{{ t.name }}</b>
              <div class="text-muted small">{{ t.description }}</div>
            </div>
          </div>

          <div class="col">
            <h6>DOING</h6>
            <div v-for="t in doing":key="t.id" class="card p-2 mb-2" @click="openTaskDetails(t)">
              <b>{{ t.name }}</b>
              <div class="text-muted small">{{ t.description }}</div>
            </div>
          </div>

          <div class="col">
            <h6>DONE</h6>
            <div v-for="t in done":key="t.id" class="card p-2 mb-2" @click="openTaskDetails(t)">
              <b>{{ t.name }}</b>
              <div class="text-muted small">{{ t.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TaskDetailsModal v-if="showDetails" :task="selectedTask" @close="showDetails = false" @updated="reloadTasks"/>
</template>

<script setup lang="ts">
import type { Story, Task } from "../models/project"
import { ref, computed, onMounted } from "vue"
import { taskApi } from "../services/taskApi"
import TaskDetailsModal from "./TaskDetailsModal.vue"

const props = defineProps<{ story: Story | null }>()
const emit = defineEmits(["updated", "close"]);

const tasks = ref<Task[]>([])

const showForm = ref(false)
const showDetails = ref(false)

const selectedTask = ref<Task | null>(null)

const name = ref("")
const description = ref("")
const priority = ref<"low" | "medium" | "high">("low")

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

  const task = {
    id: String(Date.now()),
    name: name.value,
    description: description.value,
    priority: priority.value,
    status: "todo" as const,
    storyId: props.story.id,
    projectId: props.story.projectId,
    createdAt: new Date().toISOString()
  }
    taskApi.create(task)

    reloadTasks()
    showForm.value = false;
    name.value = ""
    description.value = ""
}

function openTaskDetails(task: Task) {
  selectedTask.value = task
  showDetails.value = true
}

function formateDate(date?:string) {

}
</script>