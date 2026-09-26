import { ParentProfile } from "../types/models.js";

export class ParentRepository {
  private parents: Map<string, ParentProfile> = new Map();

  async create(parent: ParentProfile): Promise<ParentProfile> {
    this.parents.set(parent.id, { ...parent });
    return { ...parent };
  }

  async findById(id: string): Promise<ParentProfile | null> {
    const parent = this.parents.get(id);
    return parent ? { ...parent } : null;
  }

  async update(id: string, updates: Partial<ParentProfile>): Promise<ParentProfile | null> {
    const existing = this.parents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.parents.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.parents.delete(id);
  }

  async list(): Promise<ParentProfile[]> {
    return Array.from(this.parents.values());
  }

  clear(): void {
    this.parents.clear();
  }
}

export const parentRepository = new ParentRepository();
