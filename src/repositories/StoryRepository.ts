import { Story } from "../types/models.js";

export class StoryRepository {
  private stories: Map<string, Story> = new Map();

  async create(story: Story): Promise<Story> {
    this.stories.set(story.id, { ...story });
    return { ...story };
  }

  async findById(id: string): Promise<Story | null> {
    const story = this.stories.get(id);
    return story ? { ...story } : null;
  }

  async findByParentId(parentId: string): Promise<Story[]> {
    return Array.from(this.stories.values()).filter((s) => s.parentId === parentId);
  }

  async findByChildId(childId: string): Promise<Story[]> {
    return Array.from(this.stories.values()).filter((s) => s.childId === childId);
  }

  async update(id: string, updates: Partial<Story>): Promise<Story | null> {
    const existing = this.stories.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.stories.set(id, updated);
    return { ...updated };
  }

  clear(): void {
    this.stories.clear();
  }
}

export const storyRepository = new StoryRepository();
