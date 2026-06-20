export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MaterialRow = {
  id: string;
  user_id: string;
  theme: string;
  subject: string;
  skill_focus: string;
  student_level: string;
  output_type: string;
  language: string;
  difficulty: string;
  input_data: Json;
  generated_content: Json;
  created_at: string;
};

export type MaterialInsert = {
  user_id?: string;
  theme: string;
  subject: string;
  skill_focus: string;
  student_level: string;
  output_type: string;
  language: string;
  difficulty: string;
  input_data: Json;
  generated_content: Json;
};
