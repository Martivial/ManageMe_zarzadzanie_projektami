import type { Task } from "../models/project";
import { storyApi } from "./storyApi"

function getAll(): Task[] {
    const data = localStorage.getItem("tasks");
    return data ? JSON.parse(data) : [];
}
function create(task: Task): Task[] {
    const tasks = getAll();
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    return tasks;
}
function update(task: Task): Task[] {
    const tasks = getAll();
    const index = tasks.findIndex(t => t.id === task.id);
    tasks[index] = task;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    return tasks;
}
function remove(id: string): Task[] {
    const tasks = getAll();
    const updated = tasks.filter(t => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(updated));

    return updated;
}
function getByStory(storyId: string): Task[] {
    return getAll().filter(t => t.storyId === storyId);
}

function updateStoryStatus(storyId: string) {
    const tasks = getAll().filter(t => t.storyId === storyId)
    const story = storyApi.getAll().find(s => s.id === storyId)

    if (!story) return

    const allDone = tasks.every(t => t.status === "done")

    if (allDone) {
        story!.status = "done"
        storyApi.update(story)
    }
}
export const taskApi = { getAll, create, update, remove, getByStory, updateStoryStatus };