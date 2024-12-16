export type Document = {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  status: 'draft' | 'published'
  metadata: Record<string, any>
}

export type DocumentVersion = {
  id: string
  document_id: string
  version_number: number
  content: string
  created_at: string
  created_by: string
  comment: string
}

export type UserRole = 'admin' | 'user'

export type Profile = {
  id: string
  user_id: string
  username: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Document, 'id'>>
      }
      document_versions: {
        Row: DocumentVersion
        Insert: Omit<DocumentVersion, 'id' | 'created_at'>
        Update: Partial<Omit<DocumentVersion, 'id'>>
      }
    }
  }
}
