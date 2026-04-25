import type { Story } from "../models/project";

const KEY = "stories";

function getAll(): Story[] {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
}

function save(data: Story[]) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

function create(story: Story): Story[] {
    const stories = getAll();
    stories.push(story);
    save(stories);
    return stories;
}

function update(story: Story): Story[] {
    const stories = getAll();
    const index = stories.findIndex(s => s.id === story.id);

    if (index !== -1) {
        stories[index] = story;
    }

    save(stories);
    return stories;
}

function remove(id: string): Story[] {
    const stories = getAll();
    const updated = stories.filter(s => s.id !== id);
    save(updated);
    return updated;
}

export const storyApi = { getAll, create, update, remove };


