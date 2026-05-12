<template>
  <div class="container py-4">

    <ProjectBoard v-if="activeProjectId" :projectId="activeProjectId" @close="close"/>
    <NotificationModal
      v-if="showNotifications"
      :notifications="notifications"
      @close="showNotifications = false"
      @refresh="refreshNotifications"
    />
    <NotificationPopup
      v-if="showPopup"
      :notification="popupNotification"
      @close="showPopup = false"
    />

    <nav class="app-navbar d-flex justify-content-between align-items-center px-3 py-2 mb-3">
      <h5 class="mb-0 text-white fw-bold">ManageMe</h5>

      <div class="d-flex gap-3 align-items-center">

        <div class="d-flex align-items-center gap-2">

          <span class="text-white small">Zalogowany:</span>

          <select v-model="currentUserId" class="form-select form-select-sm" style="width:140px">
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.firstName }} {{ u.lastName }} {{ u.role }}
            </option>
          </select>

          <div class="position-relative" style="cursor:pointer" @click="showNotifications = true">
            <i class="bi bi-bell-fill text-white fs-5"></i>

            <span
              v-if="unreadNotifications > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ unreadNotifications }}
            </span>
          </div>

        </div>

        <button class="btn btn-sm btn-dark" @click="toggleTheme">🌙 / ☀️</button>
        <button class="btn btn-light btn-sm fw-bold" @click="openAdd">+ Dodaj projekt</button>

      </div>
    </nav>

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

    <div class="row mt-3">
      <div v-for="p in projects" :key="p.id" class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">

          <div class="card-header fw-bold">{{ p.name }}</div>

          <div class="card-body">
            <p class="card-text">{{ p.description }}</p>
          </div>

          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-success btn-sm" @click="openProject(p.id)">Otwórz</button>
            <button class="btn btn-warning btn-sm" @click="edit(p)">Edytuj</button>
            <button class="btn btn-danger btn-sm" @click="remove(p.id)">Usuń</button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { projectApi } from "./services/projectApi"
import type { Project } from "./models/project"
import ProjectBoard from "./components/ProjectBoard.vue"
import { notificationApi } from "./services/notificationApi"
import { userApi } from "./services/userApi"
import NotificationModal from "./components/NotificationModal.vue"
import NotificationPopup from "./components/NotificationPopup.vue"

const showPopup = ref(false)
const popupNotification = ref<any>(null)

const projects = ref<Project[]>([])
const name = ref("")
const description = ref("")

const showModal = ref(false)
const editId = ref<string | null>(null)

const users = userApi.getAll()
const currentUserId = ref(1)

const showNotifications = ref(false)
const notificationsVersion = ref(0)

const activeProjectId = ref<string | null>(null)

const currentUser = computed(() =>
  users.find(u => u.id === currentUserId.value)!
)

const unreadNotifications = computed(() =>
  notificationApi.getUnreadCount(currentUser.value.id)
)

const notifications = computed(() => {
  notificationsVersion.value
  return notificationApi
    .getForUser(currentUser.value.id)
    .sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
})

onMounted(() => {
  projects.value = projectApi.getAll()
  activeProjectId.value = projectApi.getActiveProject()

  const saved =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

  setTheme(saved)

  const savedUser = localStorage.getItem("currentUserId")
  if (savedUser) {
    currentUserId.value = Number(savedUser)
  }

  window.addEventListener("notification-popup", (e: any) => {
    popupNotification.value = e.detail
    showPopup.value = true
  })

  window.addEventListener("notifications-updated", refreshNotifications)
})

watch(currentUserId, (id) => {
  localStorage.setItem("currentUserId", String(id))
})

function refreshNotifications() {
  notificationsVersion.value++
}

function openAdd() {
  editId.value = null
  name.value = ""
  description.value = ""
  showModal.value = true
}

function edit(p: Project) {
  editId.value = p.id
  name.value = p.name
  description.value = p.description
  showModal.value = true
}

function save() {
  const payload = {
    id: editId.value ?? String(Date.now()),
    name: name.value,
    description: description.value
  }

  if (!editId.value) {
    projectApi.create(payload)
    notificationApi.notifyProjectCreated(payload.name)
  } else {
    projectApi.update(payload)
  }

  projects.value = projectApi.getAll()
  showModal.value = false
}

function remove(id: string) {
  projects.value = projectApi.remove(id)
}

function close() {
  showModal.value = false
  projectApi.deleteActiveProject()
  activeProjectId.value = null
}

function openProject(id: string) {
  projectApi.setActiveProject(id)
  activeProjectId.value = id
}

function setTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("theme", theme)
}

function toggleTheme() {
  const current = localStorage.getItem("theme") || "light"
  setTheme(current === "light" ? "dark" : "light")
}
</script>