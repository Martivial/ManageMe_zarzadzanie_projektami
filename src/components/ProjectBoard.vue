<template>
  <div class="modal d-block bg-dark bg-opacity-50">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content p-4">

        <div class="d-flex justify-content-between mb-3">
           <div>
            <h4 class="mb-1">{{ project?.name }}</h4>
             <p class="text-muted mb-0 small">{{ project?.description }}</p>
            </div>
          <button class="btn btn-sm btn-secondary" @click="$emit('close')">X</button>
        </div>

        <div class="row text-center">

          <div class="col border-end">
            <h5>TODO</h5>
            <button class="btn btn-sm btn-outline-primary mb-2" @click="openModal('todo')">+ Add</button>

            <div v-for="s in getStoriesByStatus('todo')" :key="s.id" class="card p-2 mb-2" @click="openTask(s)">
              <div class="d-flex justify-content-between">

                <div class="text-start">
                  <span class="badge mb-1" :class="{'bg-success': s.priority === 'low','bg-warning text-dark': s.priority === 'medium',
                      'bg-danger': s.priority === 'high'}">{{ s.priority }}
                  </span>
                  <div><b>{{ s.name }}</b></div>
                  <div class="text-muted small">{{ s.description }}</div>

                </div>

                <div class="d-flex gap-2">
                  <i class="bi bi-pencil" @click.stop="editStory(s)" style="cursor:pointer"></i>
                  <i class="bi bi-trash text-danger" @click.stop="deleteStory(s.id)" style="cursor:pointer"></i>
                </div>

              </div>
            </div>
          </div>

          <div class="col border-end">
            <h5>DOING</h5>
            <button class="btn btn-sm btn-outline-primary mb-2" @click="openModal('doing')">+ Add</button>

            <div v-for="s in getStoriesByStatus('doing')" :key="s.id" class="card p-2 mb-2" @click="openTask(s)">
              <div class="d-flex justify-content-between">

                <div class="text-start">

                  <span class="badge mb-1":class="{'bg-success': s.priority === 'low','bg-warning text-dark': s.priority === 'medium',
                      'bg-danger': s.priority === 'high'}">{{ s.priority }}
                  </span>

                  <div><b>{{ s.name }}</b></div>
                  <div class="text-muted small">{{ s.description }}</div>

                </div>

                <div class="d-flex gap-2">
                  <i class="bi bi-pencil" @click.stop="editStory(s)" style="cursor:pointer"></i>
                  <i class="bi bi-trash text-danger" @click.stop="deleteStory(s.id)" style="cursor:pointer"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col">
            <h5>DONE</h5>
            <button class="btn btn-sm btn-outline-primary mb-2" @click="openModal('done')">+ Add</button>

            <div v-for="s in getStoriesByStatus('done')" :key="s.id" class="card p-2 mb-2" @click="openTask(s)">
              <div class="d-flex justify-content-between">

                <div class="text-start">

                  <span class="badge mb-1" :class="{ 'bg-success': s.priority === 'low', 'bg-warning text-dark': s.priority === 'medium',
                      'bg-danger': s.priority === 'high' }">{{ s.priority }}
                  </span>

                  <div><b>{{ s.name }}</b></div>
                  <div class="text-muted small">{{ s.description }}</div>

                </div>

                <div class="d-flex gap-2">
                  <i class="bi bi-pencil" @click.stop="editStory(s)" style="cursor:pointer"></i>
                  <i class="bi bi-trash text-danger" @click.stop="deleteStory(s.id)" style="cursor:pointer"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <StoryCreateModal 
  v-if="showModal" :projectId="projectId" :status="selectedStatus" :story="selectedStory" @close="showModal=false" @created="reload"
  />
  <TaskModal v-if="showTaskModal" :story="selectedStoryForTask" @close = "showTaskModal = false" @updated="sync" />

</template>

<script setup lang="ts">

const props = defineProps<{projectId: string}>();

import { ref, computed, onMounted } from "vue";
import { storyApi } from "../services/storyApi";
import type { Story } from "../models/project";
import StoryCreateModal from "./StoryCreateModal.vue";
import { projectApi } from "../services/projectApi";
import type { Project } from "../models/project";
import TaskModal from "./TaskModal.vue";


const selectedStatus = ref<"todo" | "doing" | "done">("todo");
const allStories = ref(storyApi.getAll());
const showModal = ref(false);

const selectedStory = ref<Story | null>(null);
    
const project = computed<Project | undefined>(() => 
    projectApi.getAll().find(p => p.id === props.projectId));

const selectedStoryForTask = ref<Story | null> (null);
const showTaskModal = ref(false);


onMounted(() => {
  allStories.value = storyApi.getAll();
});

const stories = computed(() =>
  allStories.value.filter(s => s.projectId === props.projectId)
);

function getStoriesByStatus(status: "todo" | "doing" | "done") {
  return stories.value.filter(s => s.status === status);
}
function reload() {
    allStories.value = storyApi.getAll();
    showModal.value = false;
}
function openModal(status: "todo" | "doing" | "done") {
    selectedStatus.value = status;
    selectedStory.value = null;
    showModal.value = true;
}
function deleteStory(id:string) {
    storyApi.remove(id);
    reload();
}
function editStory(story: Story) {
    selectedStory.value = {...story };
    selectedStatus.value = story.status;
    showModal.value = true;
}

function sync() { allStories.value = storyApi.getAll()}

function openTask(story: Story) {
  selectedStoryForTask.value = story;
  showTaskModal.value = true;
}
</script>


<style scoped>
.card:hover {
  transform: scale(1.02);
  transition: 0.2s;
  cursor: pointer;
}
</style>