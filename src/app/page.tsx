'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import XMLPreview from '@/components/Preview/XMLPreview';
import TemplateSelector from '@/components/Templates/TemplateSelector';
import { exportToHTML, downloadAsFile } from '@/lib/export';

const XMLEditor = dynamic(() => import('@/components/Editor/XMLEditor'), {
  ssr: false,
});

export default function Home() {
  const [xml, setXml] = useState<string>('');
  const [previewType, setPreviewType] = useState<'pdf' | 'xml'>('pdf');

  const handleExport = async (format: 'html' | 'pdf') => {
    try {
      if (format === 'html') {
        const html = exportToHTML(xml);
        downloadAsFile(html, 'document.html', 'text/html');
      }
      // PDF export can be added later using a library like jsPDF or html2pdf
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">S1000D Technical Writer</h1>
        <div className="flex items-center gap-4">
          <TemplateSelector onSelect={setXml} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewType('pdf')}
              className={`px-3 py-1 rounded ${
                previewType === 'pdf' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setPreviewType('xml')}
              className={`px-3 py-1 rounded ${
                previewType === 'xml' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              XML
            </button>
          </div>
          <button
            onClick={() => handleExport('html')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="w-1/2 border-r">
          <XMLEditor value={xml} onChange={setXml} />
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 overflow-auto bg-gray-50">
          <XMLPreview 
            xml={xml} 
            previewType={previewType}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
