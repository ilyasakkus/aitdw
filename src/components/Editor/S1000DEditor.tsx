'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const S1000D_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    ['table'],
    ['clean'],
    ['s1000d-dmrl', 's1000d-dml', 's1000d-pm']
  ]
};

const S1000D_FORMATS = {
  'dmrl': {
    className: 'urn:s1000d:dmrl',
    tag: 'div'
  },
  'dml': {
    className: 'urn:s1000d:dml',
    tag: 'div'
  },
  'pm': {
    className: 'urn:s1000d:pm',
    tag: 'div'
  }
};

interface S1000DEditorProps {
  onChange: (content: string) => void;
  initialContent?: string;
}

export default function S1000DEditor({ onChange, initialContent }: S1000DEditorProps) {
  const [editorContent, setEditorContent] = useState(initialContent || '');

  useEffect(() => {
    if (initialContent) {
      setEditorContent(initialContent);
    }
  }, [initialContent]);

  const handleChange = useCallback((content: string) => {
    setEditorContent(content);
    onChange(content);
  }, [onChange]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">S1000D Content Editor</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={handleChange}
          modules={S1000D_MODULES}
          formats={Object.keys(S1000D_FORMATS)}
          className="h-full"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 42px)'
          }}
        />
      </div>
    </div>
  );
}
