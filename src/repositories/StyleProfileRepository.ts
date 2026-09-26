import { ParentStyleProfile } from "../types/models.js";

export class StyleProfileRepository {
  private profiles: Map<string, ParentStyleProfile> = new Map();

  async create(profile: ParentStyleProfile): Promise<ParentStyleProfile> {
    this.profiles.set(profile.id, { ...profile });
    return { ...profile };
  }

  async findById(id: string): Promise<ParentStyleProfile | null> {
    const profile = this.profiles.get(id);
    return profile ? { ...profile } : null;
  }

  async findByParentId(parentId: string): Promise<ParentStyleProfile | null> {
    for (const profile of this.profiles.values()) {
      if (profile.parentId === parentId) {
        return { ...profile };
      }
    }
    return null;
  }

  async update(id: string, updates: Partial<ParentStyleProfile>): Promise<ParentStyleProfile | null> {
    const existing = this.profiles.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.profiles.set(id, updated);
    return { ...updated };
  }

  async deleteByParentId(parentId: string): Promise<boolean> {
    let deleted = false;
    for (const [id, profile] of this.profiles.entries()) {
      if (profile.parentId === parentId) {
        this.profiles.delete(id);
        deleted = true;
      }
    }
    return deleted;
  }

  clear(): void {
    this.profiles.clear();
  }
}

export const styleProfileRepository = new StyleProfileRepository();
