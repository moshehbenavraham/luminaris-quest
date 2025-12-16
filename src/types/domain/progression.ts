export type SceneType = 'social' | 'skill' | 'combat' | 'journal' | 'exploration';

export interface Milestone {
  id: string;
  level: number;
  label: string;
  achieved: boolean;
  achievedAt?: number; // Use timestamp instead of Date
}

export interface CompletedScene {
  id: string;
  sceneId: string;
  type: SceneType;
  title: string;
  success: boolean;
  roll: number;
  dc: number;
  trustChange: number;
  completedAt: number; // Use timestamp instead of Date
}
