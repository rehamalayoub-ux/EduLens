export type UserRole = "supervisor" | "director" | "admin";
export type EvaluationStatus = "draft" | "completed";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  department?: string;
  created_at: string;
}

export interface Supervisor {
  id: string;
  user_id: string;
  full_name: string;
  department: string;
  stage: string;
  created_at: string;
  // computed
  teacherCount?: number;
  monthVisits?: number;
  completedReports?: number;
  completionRate?: number;
  lastActivity?: string;
}

export interface Teacher {
  id: string;
  user_id: string;          // supervisor's user_id
  name: string;
  subject: string;
  grade_level: string;
  school_department: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  user_id: string;
  teacher_id: string;
  date: string;
  subject: string;
  grade_level: string;
  lesson_topic: string;
  visit_type?: string;
  observation_notes: string | null;
  lesson_planning_score: number | null;
  classroom_environment_score: number | null;
  time_management_score: number | null;
  classroom_management_score: number | null;
  clarity_score: number | null;
  teaching_strategies_score: number | null;
  student_engagement_score: number | null;
  resources_score: number | null;
  assessment_score: number | null;
  lesson_closing_score: number | null;
  professional_performance_score: number | null;
  average_score: number | null;
  ai_strengths: string | null;
  ai_improvement_areas: string | null;
  ai_recommendations: string | null;
  ai_professional_development_plan: string | null;
  ai_summary: string | null;
  final_comments: string | null;
  status: EvaluationStatus;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
}

export interface RubricCategory {
  key: string;
  title: string;
  description: string;
  details: string[];
  icon: string;
  aiHint: string;
}
