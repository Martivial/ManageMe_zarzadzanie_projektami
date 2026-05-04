<template>
  <div class="modal d-block bg-dark bg-opacity-50">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content p-3">

        <h5>{{ task?.name }}</h5>

        <div v-if="task">
          <div>Opis: {{ task.description }}</div>
          <div>Przypisana historyjka {{ getStoryName(task.storyId)}}</div>
          <div>Priorytet: {{ task.priority }}</div>
          <div>Status: {{ task.status }}</div>
          <div>Data startu {{ formatDate(task.startAt) }}</div>
          <div>Koniec: {{ formatDate(task.endAt) || "-" }}</div>
          <div>Przypisana osoba: {{ getUserName(task?.assignedUserId)}}</div>
          <div>Szacowane godziny: {{ task.estimatedHours }}</div>
        </div>
        <hr>

        <div v-if="task?.status === 'todo'">
          <h6>Przypisz osobę</h6>
           <div class="input-group input-group-sm w-75">
            <select v-model="selectedUserId" class="form-select form-select-sm border border-primary shadow-sm">
               <option v-for="u in users.filter(u => u.role !== 'admin')" :key="u.id" :value="u.id">
                 {{ u.firstName }} {{ u.lastName }} {{ u.role }}
              </option>
             </select>

             <button class="btn btn-primary" @click="assignUser">Przypisz</button>
          </div>
          </div>

        <button v-if="task?.status === 'doing'" @click="markDone" class="btn btn-success btn-sm  me-2">Zaznacz wykonanie zadania</button>
        <button @click="$emit('close')" class="btn btn-danger btn-sm mt-2">Zamknij</button>

      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Task } from "../models/project"
import type { User } from "../models/user"
import { userApi } from "../services/userApi"
import {ref} from 'vue';
import {storyApi} from "../services/storyApi"
import type {Story} from "../models/project"
import {taskApi} from "../services/taskApi"


const stories: Story[] = storyApi.getAll();
const users: User[] = userApi.getAll();
const emit = defineEmits(["updated", "close"]);

const props = defineProps<{task: Task | null}>();

const selectedUserId = ref<number | null>(null);

function getStoryName(id: string) {
  return stories.find(s=> s.id === id)?.name ||"-"
}
function getUserName(id?: number) {
  const user = users.find(u => u.id === id)
  return user ? `${user.firstName} ${user.lastName} ${user.role}` : "-"
}
function formatDate(date?: string) {
  if (!date) return "-"
  return new Date(date).toLocaleString("pl-PL")
}
function assignUser() {
  if (!props.task) return
  if(props.task.status !=="todo") return

  props.task.assignedUserId = selectedUserId.value ?? undefined

  if(props.task.status === "todo") {
    props.task.status = "doing";
    props.task.startAt = new Date().toISOString();
  }
  taskApi.update(props.task)

  const story = storyApi.getAll().find( s=>s.id === props.task!.storyId)

  if(story && story.status === "todo") {
    story.status = "doing"
    storyApi.update(story)
  }
  emit("updated")
}

function markDone() {
  if (!props.task) return 
  
  props.task.status = "done"
  props.task.endAt = new Date().toISOString()

  taskApi.update(props.task)
  taskApi.updateStoryStatus(props.task.storyId);
  emit("updated")
}


</script>