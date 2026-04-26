import type { Project } from "../models/project";
import type { User } from "../models/user";

const KEY = "projects";
const ACTIVE_KEY = "activeProjectId";

function getAll(): Project[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function save(data: Project[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function create(project: Project): Project[] {
  const projects = getAll();
  projects.push(project);
  save(projects);
  return projects;
}

function update(project: Project): Project[] {
  const projects = getAll();

  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
  }

  save(projects);
  return projects;
}

function remove(id: string): Project[] {
  const projects = getAll();
  const updated = projects.filter(p => p.id !== id);
  save(updated);
  return updated;
}

export const projectApi = {
  getAll,
  create,
  update,
  remove,
  setActiveProject,
  getActiveProject,
  deleteActiveProject
}

const mockUsers: User[] = [
  { id: "1", firstName: "Mateusz", lastName: "Zemsta", role: "admin" },
  { id: "2", firstName: "Anna", lastName: "Kowalska", role: "developer" },
  { id: "3", firstName: "Jan", lastName: "Nowak", role: "devops" }
];

export function getUser(): User[] {
  return mockUsers;
}
export function setActiveProject(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}
export function getActiveProject(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}
export function deleteActiveProject() {
  localStorage.removeItem(ACTIVE_KEY);
}

