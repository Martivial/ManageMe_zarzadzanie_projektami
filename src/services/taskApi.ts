import type { Task } from "../models/project";

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

export const taskApi = { getAll, create, update, remove, getByStory };