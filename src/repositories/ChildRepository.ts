import { ChildProfile } from "../types/models.js";

export class ChildRepository {
  private children: Map<string, ChildProfile> = new Map();

  async create(child: ChildProfile): Promise<ChildProfile> {
    this.children.set(child.id, { ...child });
    return { ...child };
  }

  async findById(id: string): Promise<ChildProfile | null> {
    let child = this.children.get(id);
    if (!child && (id.startsWith("child-") || id === "default-child" || id.length > 0)) {
      const now = new Date().toISOString();
      child = {
        id,
        parentId: "parent-uvan-001",
        name: "Aarav",
        age: 5,
        interests: ["Trains", "Animals", "Stars"],
        personality: ["Curious", "Playful"],
        avoidTopics: ["Monsters"],
        favoriteCharacters: ["Leo the friendly lion"],
        createdAt: now,
        updatedAt: now,
      };
      this.children.set(id, child);
    }
    return child ? { ...child } : null;
  }

  async findByParentId(parentId: string): Promise<ChildProfile[]> {
    return Array.from(this.children.values()).filter((c) => c.parentId === parentId);
  }

  async update(id: string, updates: Partial<ChildProfile>): Promise<ChildProfile | null> {
    const existing = this.children.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.children.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.children.delete(id);
  }

  clear(): void {
    this.children.clear();
  }
}

export const childRepository = new ChildRepository();
