export interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'review' | 'published';
  version: number;
}

export interface WorkflowTask {
  id: string;
  document_id: string;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed';
  task_type: 'review' | 'approve' | 'edit';
  created_at: string;
  due_date: string;
  comments: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'reviewer';
  full_name: string;
  created_at: string;
}
