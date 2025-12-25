export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      combat_history: {
        Row: {
          actions_used: Json;
          combat_log: Json | null;
          created_at: string | null;
          enemy_id: string;
          enemy_name: string;
          final_enemy_hp: number;
          final_player_hp: number;
          id: string;
          journal_entry_id: string | null;
          player_level: number;
          resources_end: Json;
          resources_start: Json;
          scene_index: number;
          turns_taken: number;
          user_id: string;
          victory: boolean;
        };
        Insert: {
          actions_used: Json;
          combat_log?: Json | null;
          created_at?: string | null;
          enemy_id: string;
          enemy_name: string;
          final_enemy_hp: number;
          final_player_hp: number;
          id?: string;
          journal_entry_id?: string | null;
          player_level: number;
          resources_end: Json;
          resources_start: Json;
          scene_index: number;
          turns_taken: number;
          user_id: string;
          victory: boolean;
        };
        Update: {
          actions_used?: Json;
          combat_log?: Json | null;
          created_at?: string | null;
          enemy_id?: string;
          enemy_name?: string;
          final_enemy_hp?: number;
          final_player_hp?: number;
          id?: string;
          journal_entry_id?: string | null;
          player_level?: number;
          resources_end?: Json;
          resources_start?: Json;
          scene_index?: number;
          turns_taken?: number;
          user_id?: string;
          victory?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'combat_history_journal_entry_id_fkey';
            columns: ['journal_entry_id'];
            isOneToOne: false;
            referencedRelation: 'journal_entries';
            referencedColumns: ['id'];
          },
        ];
      };
      game_states: {
        Row: {
          current_scene_index: number;
          experience_points: number | null;
          experience_to_next: number | null;
          guardian_trust: number;
          light_points: number | null;
          max_player_energy: number | null;
          max_player_health: number | null;
          milestones: Json;
          player_energy: number | null;
          player_health: number | null;
          player_level: number;
          player_statistics: Json | null;
          scene_history: Json;
          shadow_points: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          current_scene_index?: number;
          experience_points?: number | null;
          experience_to_next?: number | null;
          guardian_trust?: number;
          light_points?: number | null;
          max_player_energy?: number | null;
          max_player_health?: number | null;
          milestones?: Json;
          player_energy?: number | null;
          player_health?: number | null;
          player_level?: number;
          player_statistics?: Json | null;
          scene_history?: Json;
          shadow_points?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          current_scene_index?: number;
          experience_points?: number | null;
          experience_to_next?: number | null;
          guardian_trust?: number;
          light_points?: number | null;
          max_player_energy?: number | null;
          max_player_health?: number | null;
          milestones?: Json;
          player_energy?: number | null;
          player_health?: number | null;
          player_level?: number;
          player_statistics?: Json | null;
          scene_history?: Json;
          shadow_points?: number | null;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      diagnose_auth_status: { Args: never; Returns: Json };
      diagnose_database_connection: { Args: never; Returns: Json };
      diagnose_journal_save: { Args: { test_id?: string }; Returns: Json };
      get_journal_entries_for_user: {
        Args: { limit_count?: number };
        Returns: Json;
      };
      test_database_connection: { Args: never; Returns: Json };
      test_journal_persistence: {
        Args: { test_content?: string; test_title?: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
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
