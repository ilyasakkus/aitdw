'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

interface S1000DVisualEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const defaultContent = `
<h1>Technical Document</h1>
<h2>1. Introduction</h2>
<p>This document provides technical information about the system.</p>

<h2>2. System Overview</h2>
<p>The system consists of the following main components:</p>
<ul>
  <li>Component A</li>
  <li>Component B</li>
  <li>Component C</li>
</ul>

<h2>3. Operating Procedures</h2>
<h3>3.1 Start-up Procedure</h3>
<ol>
  <li>Ensure all connections are secure</li>
  <li>Power on the main unit</li>
  <li>Wait for system initialization</li>
  <li>Verify status indicators</li>
</ol>

<h2>4. Maintenance</h2>
<h3>4.1 Routine Maintenance</h3>
<p>Perform the following maintenance tasks monthly:</p>
<ul>
  <li>Clean external surfaces</li>
  <li>Check all connections</li>
  <li>Verify system operation</li>
</ul>
`;

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean'],
    ['link', 'image']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'link', 'image'
];

export default function S1000DVisualEditor({ value, onChange }: S1000DVisualEditorProps) {
  const [editorValue, setEditorValue] = useState(value || defaultContent);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className="h-full flex flex-col">
      <QuillEditor
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        className="flex-1 overflow-auto"
      />
    </div>
  );
}
