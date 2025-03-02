export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_files: {
        Row: {
          client_id: string
          id: string
          name: string
          size: number
          storage_path: string | null
          type: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          client_id: string
          id?: string
          name: string
          size: number
          storage_path?: string | null
          type: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string
          id?: string
          name?: string
          size?: number
          storage_path?: string | null
          type?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          read: boolean
          sender_is_user: boolean
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          read?: boolean
          sender_is_user: boolean
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_is_user?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_since: string | null
          company: string
          created_at: string
          email: string
          id: string
          last_activity: string | null
          name: string
          notes: string | null
          phone: string
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_since?: string | null
          company: string
          created_at?: string
          email: string
          id?: string
          last_activity?: string | null
          name: string
          notes?: string | null
          phone: string
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_since?: string | null
          company?: string
          created_at?: string
          email?: string
          id?: string
          last_activity?: string | null
          name?: string
          notes?: string | null
          phone?: string
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kanban_columns: {
        Row: {
          created_at: string
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kanban_tasks: {
        Row: {
          assigned_to: string | null
          client_name: string | null
          column_id: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          order_index: number
          priority: Database["public"]["Enums"]["task_priority"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_name?: string | null
          column_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          order_index: number
          priority: Database["public"]["Enums"]["task_priority"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_name?: string | null
          column_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          order_index?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unread_counts:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              client_id: string
              unread_count: number
            }[]
          }
        | {
            Args: {
              read_filter: boolean
              sender_filter: boolean
            }
            Returns: {
              client_id: string
              unread_count: number
            }[]
          }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_admin_or_collaborator: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      task_priority: "Low" | "Medium" | "High" | "Urgent"
      task_type:
        | "Tax Filing"
        | "Audit"
        | "Consultation"
        | "Bookkeeping"
        | "Payroll"
      user_role: "Admin" | "Collaborator" | "Client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
