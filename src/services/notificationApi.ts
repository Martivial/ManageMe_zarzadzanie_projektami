import type { Notification } from "../models/notification"
import { userApi } from "../services/userApi"

const STORAGE_KEY = "notifications"

function getAll(): Notification[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
}

function saveAll(notifications: Notification[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

function create(notification: Notification) {
    const notifications = getAll()

    notifications.push(notification)
    saveAll(notifications)

    const currentUserId = Number(localStorage.getItem("currentUserId"))

    if (
        notification.recipientId === currentUserId &&
        (notification.priority === "medium" || notification.priority === "high")
    ) {
        window.dispatchEvent(
            new CustomEvent("notification-popup", {
                detail: notification
            })
        )
    }
}

function notifyProjectCreated(projectName: string) {
    const admins = userApi.getAll().filter(u => u.role === "admin")

    admins.forEach(admin => {
        create({
            id: String(Date.now() + Math.random()),
            title: "Utworzono nowy projekt",
            message: `Nowy projekt: ${projectName}`,
            date: new Date().toISOString(),
            priority: "high",
            isRead: false,
            recipientId: admin.id,
            type: "project"
        })
    })
}

function notifyTaskAssigned(userId: number, taskName: string, taskId?: string) {
    create({
        id: String(Date.now() + Math.random()),
        title: "Przypisanie do zadania",
        message: `Zostałeś przypisany do: ${taskName}`,
        date: new Date().toISOString(),
        priority: "high",
        isRead: false,
        recipientId: userId,
        type: "task",
        relatedId: taskId
    })
}

function notifyTaskDeleted(ownerId: number, taskName: string, taskId?: string) {
    create({
        id: String(Date.now() + Math.random()),
        title: "Usunięto zadanie",
        message: `Usunięto zadanie: ${taskName}`,
        date: new Date().toISOString(),
        priority: "medium",
        isRead: false,
        recipientId: ownerId,
        type: "task",
        relatedId: taskId
    })
}

function notifyTaskStatusChanged(ownerId: number, taskName: string, status: string, taskId?: string) {
    create({
        id: String(Date.now() + Math.random()),
        title: "Zmiana statusu zadania",
        message: `${taskName} → ${status}`,
        date: new Date().toISOString(),
        priority: status === "done" ? "medium" : "low",
        isRead: false,
        recipientId: ownerId,
        type: "task",
        relatedId: taskId
    })
}

function getForUser(userId: number) {
    return getAll().filter(n => n.recipientId === userId)
}

function getUnreadCount(userId: number) {
    return getForUser(userId).filter(n => !n.isRead).length
}

function markAsRead(id: string) {
    const updated = getAll().map(n =>
        n.id === id ? { ...n, isRead: true } : n
    )

    saveAll(updated)
    return updated
}
function notifyTaskCreated(ownerId: number, taskName: string, taskId?: string) {
    create({
        id: String(Date.now() + Math.random()),
        title: "Nowe zadanie w historyjce",
        message: `Dodano zadanie: ${taskName}`,
        date: new Date().toISOString(),
        priority: "medium",
        isRead: false,
        recipientId: ownerId,
        type: "task",
        relatedId: taskId
    })
}
export const notificationApi = {
    getAll,
    create,
    getForUser,
    getUnreadCount,
    markAsRead,
    notifyProjectCreated,
    notifyTaskAssigned,
    notifyTaskDeleted,
    notifyTaskCreated,
    notifyTaskStatusChanged
}