'use client';

import { useState } from 'react';
import XMLEditor from './XMLEditor';
import XMLPreview from '../Preview/XMLPreview';

interface EditorLayoutProps {
  initialXML?: string;
}

export default function EditorLayout({ initialXML = '' }: EditorLayoutProps) {
  const [xml, setXml] = useState(initialXML);
  const [previewType, setPreviewType] = useState<'pdf' | 'xml'>('pdf');

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 mt-16">
      {/* Left side - Editor */}
      <div className="w-1/2 p-4 overflow-hidden">
        <XMLEditor value={xml} onChange={setXml} />
      </div>

      {/* Right side - Preview */}
      <div className="w-1/2 border-l border-gray-200">
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
          <button
            className={`px-4 py-2 rounded-lg mr-2 ${
              previewType === 'pdf' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setPreviewType('pdf')}
          >
            PDF Preview
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              previewType === 'xml' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setPreviewType('xml')}
          >
            XML Preview
          </button>
        </div>
        <div className="h-[calc(100vh-6rem)]">
          <XMLPreview xml={xml} previewType={previewType} />
        </div>
      </div>
    </div>
  );
}
