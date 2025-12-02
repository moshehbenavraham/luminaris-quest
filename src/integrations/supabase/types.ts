export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_key in never]: never;
    };
    Views: {
      [_key in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_key in never]: never;
    };
    CompositeTypes: {
      [_key in never]: never;
    };
  };
  public: {
    Tables: {
      game_states: {
        Row: {
          current_scene_index: number;
          experience_points: number;
          experience_to_next: number;
          guardian_trust: number;
          light_points: number;
          max_player_energy: number;
          milestones: Json;
          player_energy: number;
          player_health: number;
          player_level: number;
          player_statistics: Json | null;
          scene_history: Json;
          shadow_points: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          current_scene_index?: number;
          experience_points?: number;
          experience_to_next?: number;
          guardian_trust?: number;
          light_points?: number;
          max_player_energy?: number;
          milestones?: Json;
          player_energy?: number;
          player_health?: number;
          player_level?: number;
          player_statistics?: Json | null;
          scene_history?: Json;
          shadow_points?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          current_scene_index?: number;
          experience_points?: number;
          experience_to_next?: number;
          guardian_trust?: number;
          light_points?: number;
          max_player_energy?: number;
          milestones?: Json;
          player_energy?: number;
          player_health?: number;
          player_level?: number;
          player_statistics?: Json | null;
          scene_history?: Json;
          shadow_points?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          content: string;
          created_at: string | null;
          edited_at: string | null;
          id: string;
          is_edited: boolean;
          scene_id: string | null;
          tags: Json;
          title: string;
          trust_level: number;
          type: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          edited_at?: string | null;
          id: string;
          is_edited?: boolean;
          scene_id?: string | null;
          tags?: Json;
          title: string;
          trust_level: number;
          type: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          edited_at?: string | null;
          id?: string;
          is_edited?: boolean;
          scene_id?: string | null;
          tags?: Json;
          title?: string;
          trust_level?: number;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          accessibility: Json;
          audio_settings: Json;
          tutorial_state: Json;
          ui_preferences: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          accessibility?: Json;
          audio_settings?: Json;
          tutorial_state?: Json;
          ui_preferences?: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          accessibility?: Json;
          audio_settings?: Json;
          tutorial_state?: Json;
          ui_preferences?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      combat_history: {
        Row: {
          id: string;
          user_id: string;
          journal_entry_id: string | null;
          enemy_id: string;
          enemy_name: string;
          victory: boolean;
          turns_taken: number;
          final_player_hp: number;
          final_enemy_hp: number;
          resources_start: Json;
          resources_end: Json;
          actions_used: Json;
          combat_log: Json | null;
          player_level: number;
          scene_index: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          journal_entry_id?: string | null;
          enemy_id: string;
          enemy_name: string;
          victory: boolean;
          turns_taken: number;
          final_player_hp: number;
          final_enemy_hp: number;
          resources_start: Json;
          resources_end: Json;
          actions_used: Json;
          combat_log?: Json | null;
          player_level: number;
          scene_index: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          journal_entry_id?: string | null;
          enemy_id?: string;
          enemy_name?: string;
          victory?: boolean;
          turns_taken?: number;
          final_player_hp?: number;
          final_enemy_hp?: number;
          resources_start?: Json;
          resources_end?: Json;
          actions_used?: Json;
          combat_log?: Json | null;
          player_level?: number;
          scene_index?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_key in never]: never;
    };
    Functions: {
      [_key in never]: never;
    };
    Enums: {
      [_key in never]: never;
    };
    CompositeTypes: {
      [_key in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
