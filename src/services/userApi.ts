import type { User } from "../models/user";

const mockUsers: User[] = [
    { id: "1", firstName: "Mateusz", lastName: "Zemsta", role: "admin" },
    { id: "2", firstName: "Anna", lastName: "Kowalska", role: "developer" },
    { id: "3", firstName: "Jan", lastName: "Nowak", role: "devops" }
];

function getAll(): User[] {
    return mockUsers;
}

function getById(id: string): User | undefined {
    return mockUsers.find(u => u.id === id);
}

export const userApi = {
    getAll,
    getById
};