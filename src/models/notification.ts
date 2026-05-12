export type ISOString = string

export type UserID = number

export type NotificationPriority = "low" | "medium" | "high"

export type Notification = {
    id: string

    title: string
    message: string

    date: ISOString

    priority: NotificationPriority

    isRead: boolean

    recipientId: UserID
}