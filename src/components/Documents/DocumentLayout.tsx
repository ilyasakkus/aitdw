'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import S1000DEditor from '@/components/Editor/S1000DEditor';
import XMLEditor from '@/components/Editor/XMLEditor';
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
  const [activePreview, setActivePreview] = useState<'pdf' | 'xml'>('pdf');
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const generatePDF = async () => {
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
        const blob = new Blob([Buffer.from(pdf, 'base64')], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsGeneratingPDF(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      generatePDF();
    }, 1000);

    return () => {
      clearTimeout(debounceTimer);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [xmlContent]);

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    // Convert rich text content to S1000D XML
    const xml = convertToS1000D(newContent);
    setXmlContent(xml);
  };

  const handleXMLChange = (newXml: string) => {
    setXmlContent(newXml);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{category}</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-8rem)]">
        {/* Left Column - S1000D Editor */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-200">
          <div className="h-full">
            <S1000DEditor
              onChange={handleEditorChange}
              initialContent={content}
            />
          </div>
        </div>

        {/* Right Column - XML Editor and Previews */}
        <div className="w-1/2 p-4 bg-white">
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setActivePreview('pdf')}
              className={`px-4 py-2 rounded ${
                activePreview === 'pdf'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              PDF Preview
            </button>
            <button
              onClick={() => setActivePreview('xml')}
              className={`px-4 py-2 rounded ${
                activePreview === 'xml'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              XML Preview
            </button>
          </div>

          <div className="bg-white rounded-lg h-[calc(100%-4rem)] overflow-auto">
            {activePreview === 'pdf' ? (
              <div className="h-full bg-gray-50 rounded border border-gray-200">
                {isGeneratingPDF ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <PDFPreview pdfUrl={pdfUrl} />
                )}
              </div>
            ) : (
              <div className="h-full bg-gray-50 rounded border border-gray-200">
                <XMLEditor
                  value={xmlContent}
                  onChange={handleXMLChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
