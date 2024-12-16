import { supabase } from '@/lib/supabase';
import { Document, WorkflowTask } from '@/types/database';

export const documentService = {
  // Document operations
  async createDocument(title: string, content: string, userId: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        content,
        user_id: userId,
        status: 'draft',
        version: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDocument(id: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  async getDocument(id: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Real-time subscription for document changes
  subscribeToDocument(id: string, callback: (document: Document) => void) {
    return supabase
      .channel(`document:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${id}`,
        },
        (payload) => callback(payload.new as Document)
      )
      .subscribe();
  },

  // Workflow operations
  async createWorkflowTask(
    documentId: string,
    assignedTo: string,
    taskType: WorkflowTask['task_type']
  ): Promise<WorkflowTask> {
    const { data, error } = await supabase
      .from('workflow_tasks')
      .insert({
        document_id: documentId,
        assigned_to: assignedTo,
        task_type: taskType,
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWorkflowTask(
    id: string,
    status: WorkflowTask['status'],
    comments?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('workflow_tasks')
      .update({
        status,
        comments,
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Get workflow tasks for a document
  async getWorkflowTasks(documentId: string): Promise<WorkflowTask[]> {
    const { data, error } = await supabase
      .from('workflow_tasks')
      .select()
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
