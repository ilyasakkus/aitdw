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
    <main className="min-h-screen p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">S1000D Technical Writer</h1>
        <TemplateSelector onSelect={setXml} />
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleExport('html')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export HTML
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[600px]">
          <XMLEditor value={xml} onChange={setXml} />
        </div>
        <div className="h-[600px]">
          <XMLPreview xml={xml} />
        </div>
      </div>
    </main>
  );
}
