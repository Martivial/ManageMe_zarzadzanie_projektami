<template>
 <div class="modal d-block bg-dark bg-opacity-50">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content p-3">

      <div class="d-flex justify-content-between mb-2">
        <h5 class="p-2 text-center"> {{ editingId ? "Edytuj" : "Nowa historyjka" }}</h5>

        <button class="btn-close" @click="emit('close')"></button>
      </div>

      <form @submit.prevent="save" class="d-grid gap-2">

        <input v-model="name" class="form-control" placeholder="Nazwa" required />
        <input v-model="description" class="form-control" placeholder="Opis" required />

        <div class="d-flex align-items-center gap-2">
        <label>Wybierz priorytet:</label>
        <select v-model="priority" class="form-select w-auto">
          <option value="low">Niski</option>
          <option value="medium">Średni</option>
          <option value="high">Wysoki</option>
        </select>
        </div>      

        <select v-if="props.story" v-model="status" class="form-select">
          <option value="todo">TODO</option>
          <option value="doing">DOING</option>
          <option value="done">DONE</option>
        </select>

        <button type="submit" class="btn btn-primary">
          {{ editingId ? "Update" : "Create" }}
        </button>

        <button type="button" class="btn btn-secondary" @click="emit('close')">
          Anuluj
        </button>

      </form>

    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import { storyApi } from "../services/storyApi";
import { watch } from "vue";

const name = ref("");
const description = ref("");
const status = ref<"todo" | "doing" | "done">("todo");
const priority = ref<"low" | "medium" | "high">("low");
const emit = defineEmits(["created", "close"]);
const editingId = ref<string | null>(null);

    
const props = defineProps<{
  projectId: string
  status: "todo" | "doing" | "done"
  story?: any
  ownerId: number
}>()

watch(() => props.story, (s) => {
  if (s) {
    editingId.value = s.id;
    name.value = s.name;
    description.value = s.description;
    priority.value = s.priority;
    status.value = s.status;
  } else {
    editingId.value = null;
    name.value = "";
    description.value = "";
    priority.value = "low";

    status.value = props.status;
  }
}, { immediate: true });

function save() {
  if (!name.value) return;

  const currentUserId = Number(localStorage.getItem("currentUserId"));

  const storyPayload = {
    id: editingId.value ?? String(Date.now()),
    name: name.value,
    description: description.value,
    priority: priority.value,
    status: status.value,
    projectId: props.projectId,

    ownerId: editingId.value
      ? props.story?.ownerId ?? currentUserId
      : currentUserId,

    createdAt: new Date().toISOString()
  };

  if (editingId.value) {
    storyApi.update(storyPayload);
  } else {
    storyApi.create(storyPayload);
  }

  emit("created");
}
</script>