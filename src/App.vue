<template>
  <h1>ManageMe</h1>

  <input v-model="name" placeholder="Nazwa" />
  <input v-model="description" placeholder="Opis" />
  <button @click="addProject">Dodaj</button>

  <ul>
    <li v-for="p in projects" :key="p.id">
      {{ p.name }} - {{ p.description }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getProjects, saveProjects } from "./services/service";
import type { Project } from "./models/project";

const projects = ref<Project[]>([]);
const name = ref("");
const description = ref("");

onMounted(() => {
  projects.value = getProjects();
});

function addProject() {
projects.value.push({
  id: String(Date.now()),
  name: name.value,
  description: description.value
});
saveProjects(projects.value)
}


</script>