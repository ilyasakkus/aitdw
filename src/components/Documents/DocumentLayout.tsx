'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import XMLEditor from '@/components/Editor/XMLEditor';
import S1000DVisualEditor from '@/components/Editor/S1000DVisualEditor';
import PDFPreview from '@/components/Preview/PDFPreview';
import { convertToS1000D } from '@/lib/s1000d/converter';

interface DocumentLayoutProps {
  title: string;
  category: string;
  defaultXML: string;
}

export default function DocumentLayout({ title, category, defaultXML }: DocumentLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [xmlContent, setXmlContent] = useState(defaultXML);
  const [activeTab, setActiveTab] = useState<'visual' | 'xml' | 'preview'>('visual');
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Sample chapters data structure
  const [chapters] = useState([
    {
      id: '1',
      title: 'Chapter 1',
      level: 0,
      children: [
        {
          id: '1.1',
          title: 'Section 1.1',
          level: 1,
          children: [
            { id: '1.1.1', title: 'Subsection 1.1.1', level: 2 },
            { id: '1.1.2', title: 'Subsection 1.1.2', level: 2 }
          ]
        },
        {
          id: '1.2',
          title: 'Section 1.2',
          level: 1
        }
      ]
    },
    {
      id: '2',
      title: 'Chapter 2',
      level: 0,
      children: [
        { id: '2.1', title: 'Section 2.1', level: 1 },
        { id: '2.2', title: 'Section 2.2', level: 1 }
      ]
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Convert visual content to XML
    const xml = convertToS1000D(newContent);
    setXmlContent(xml);
  };

  const handleXMLChange = (newXML: string) => {
    setXmlContent(newXML);
  };

  const handleGeneratePDF = async () => {
    if (!xmlContent) return;
    
    try {
      setIsGeneratingPDF(true);
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const { pdf } = await response.json();
      setPdfUrl(`data:application/pdf;base64,${pdf}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white shadow-sm h-12 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium">{title}</h1>
          <span className="text-sm text-gray-500">{category}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === 'visual' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            Visual Editor
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === 'xml' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            XML
          </button>
          <button
            onClick={() => {
              setActiveTab('preview');
              handleGeneratePDF();
            }}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'visual' && (
          <div className="h-full">
            <S1000DVisualEditor value={content} onChange={handleContentChange} />
          </div>
        )}
        {activeTab === 'xml' && (
          <div className="h-full">
            <XMLEditor
              value={xmlContent}
              onChange={handleXMLChange}
              chapters={chapters}
            />
          </div>
        )}
        {activeTab === 'preview' && (
          <div className="h-full bg-gray-100">
            <PDFPreview
              xmlContent={xmlContent}
              pdfUrl={pdfUrl}
              onRenderClick={handleGeneratePDF}
            />
          </div>
        )}
      </div>
    </div>
  );
}
