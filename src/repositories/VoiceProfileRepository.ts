import { VoiceProfile } from "../types/models.js";

export class VoiceProfileRepository {
  private profiles: Map<string, VoiceProfile> = new Map();

  async create(profile: VoiceProfile): Promise<VoiceProfile> {
    this.profiles.set(profile.id, { ...profile });
    return { ...profile };
  }

  async findById(id: string): Promise<VoiceProfile | null> {
    const profile = this.profiles.get(id);
    return profile ? { ...profile } : null;
  }

  async findByParentId(parentId: string): Promise<VoiceProfile | null> {
    for (const profile of this.profiles.values()) {
      if (profile.parentId === parentId) {
        return { ...profile };
      }
    }
    return null;
  }

  async update(id: string, updates: Partial<VoiceProfile>): Promise<VoiceProfile | null> {
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

export const voiceProfileRepository = new VoiceProfileRepository();
