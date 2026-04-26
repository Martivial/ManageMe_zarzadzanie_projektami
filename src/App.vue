<template>
  <div class="container py-4">

    <ProjectBoard v-if="activeProjectId" :projectId="activeProjectId" @close="activeProjectId = null"/>

    <div class="d-flex justify-content-between mb-3">
      <h1>ManageMe</h1>
      

      <!-- user  -->
       <div class="d-flex gap-3 align-items-center">
        <div v-if="user" class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
            style="width: 38px; height: 38px;"> {{ user.firstName[0] }}{{ user.lastName[0] }}
            </div>
      <button class="btn btn-primary" @click="openAdd">+ Add</button>
      </div>

    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal d-block">
      <div class="modal-dialog">
        <div class="modal-content p-3">

         <form @submit.prevent="save">
          <input class="form-control mb-2" v-model="name" placeholder="Nazwa" required />
          <input class="form-control mb-3" v-model="description" placeholder="Opis" required />

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-success">Zapisz</button>
           <button type="button" class="btn btn-secondary" @click="close">Anuluj</button>
          </div>
          </form>
          
        </div>
      </div>
    </div>

 <!-- ?lista -->
   <div class="row mt-3">
  <div v-for="p in projects" :key="p.id" class="col-md-4 mb-3">
    <div class="card shadow-sm h-100">

      <div class="card-header fw-bold">{{ p.name }}</div>

      <div class="card-body">
        <p class="card-text">{{ p.description }}</p>
      </div>

      <div class="card-footer d-flex justify-content-end gap-2">
        <button class="btn btn-success btn-sm" @click="openProject(p.id)">Open</button>
        <button class="btn btn-warning btn-sm" @click="edit(p)">edit</button>
        <button class="btn btn-danger btn-sm" @click="remove(p.id)">delete</button>
      </div>

    </div>
  </div>
</div>
 </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { projectApi } from "./services/projectApi";
import type { Project} from "./models/project";

import ProjectBoard from "./components/ProjectBoard.vue";
import type { User } from "./models/user";

const projects = ref<Project[]>([]);
const name = ref("");
const description = ref("");

const showModal = ref(false);
const editId = ref<string | null>(null);

const user = ref<User | null>(null);
const activeProjectId = ref<string | null>(null);

onMounted(() => {
  projects.value = projectApi.getAll();
  activeProjectId.value = projectApi.getActiveProject();
});

function openAdd() {
  editId.value = null;
  name.value = "";
  description.value = "";
  showModal.value = true;
}

function edit(p: Project) {
  editId.value = p.id;
  name.value = p.name;
  description.value = p.description;
  showModal.value = true;
}

function save() {
  const payload = {
    id: editId.value ?? String(Date.now()),
    name: name.value,
    description: description.value
  };

  projects.value = editId.value ? projectApi.update(payload) : projectApi.create(payload);

  showModal.value = false;
}

function remove(id: string) {
  projects.value = projectApi.remove(id);
}

function close() {
  showModal.value = false;
  projectApi.deleteActiveProject();
  activeProjectId.value = null;
}

function openProject(id: string) {
  projectApi.setActiveProject(id);
  activeProjectId.value = id;
}
</script>