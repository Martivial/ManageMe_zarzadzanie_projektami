export interface Project {
    id: string;
    name: string;
    description: string;
}
export interface Story {
    id: string;
    name: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "doing" | "done";
    projectId: string;
    ownerId: string;
    createdAt: string;
}
export interface Task {
    id: string;
    name: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "doing" | "done";
    storyId: string;
    projectId: string;
    assignedUserId?: number;
    estimatedHours: number;
    createdAt: string;
    startAt?: string;
    endAt?: string;
}