export interface JournalEntry {
  id: string;
  type: 'milestone' | 'learning';
  trustLevel: number;
  content: string;
  timestamp: Date;
  title: string;
  sceneId?: string;
  tags?: string[];
  isEdited?: boolean;
  editedAt?: Date;
}
