'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const DocumentEditor = () => {
  const [saving, setSaving] = useState(false);
  const supabase = createClientComponentClient();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Bir şeyler yazmaya başlayın...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Supabase storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Editöre ekle
      editor?.chain().focus().setImage({ src: publicUrl }).run();

    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    
    setSaving(true);
    try {
      const content = editor.getJSON();
      
      const { error } = await supabase
        .from('documents')
        .insert([
          {
            content,
            title: 'Yeni Döküman', // Bu kısmı dinamik yapabilirsiniz
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Döküman Başlığı"
          className="text-2xl font-bold border-none focus:outline-none w-full"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => document.getElementById('image-input')?.click()}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Görsel Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <input
        type="file"
        id="image-input"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />

      <div className="prose-lg max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default DocumentEditor; 