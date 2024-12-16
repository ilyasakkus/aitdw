'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import XMLEditor from '@/components/Editor/XMLEditor';
import PDFPreview from '@/components/Preview/PDFPreview';

const defaultXML = `<?xml version="1.0" encoding="UTF-8"?>
<dmodule>
  <identAndStatusSection>
    <dmAddress>
      <dmIdent>
        <dmCode modelIdentCode="DEMO" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="A" infoCode="040" infoCodeVariant="A" itemLocationCode="C"/>
        <language languageIsoCode="en" countryIsoCode="US"/>
        <issueInfo issueNumber="000" inWork="01"/>
      </dmIdent>
      <dmAddressItems>
        <issueDate year="2024" month="01" day="01"/>
        <dmTitle>
          <techName>Technical Document</techName>
          <infoName>Description</infoName>
        </dmTitle>
      </dmAddressItems>
    </dmAddress>
  </identAndStatusSection>
</dmodule>`;

export default function Documents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [xmlContent, setXmlContent] = useState(defaultXML);
  const [activePreview, setActivePreview] = useState<'pdf' | 'xml'>('pdf');
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    // Here you would typically generate/update the PDF URL based on the XML content
    // For now, we'll use a placeholder
    setPdfUrl('/sample.pdf');
  }, [xmlContent]);

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
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Column - Editor */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-200">
          <div className="h-full">
            <XMLEditor 
              value={xmlContent}
              onChange={setXmlContent}
            />
          </div>
        </div>

        {/* Right Column - Previews */}
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
                <PDFPreview pdfUrl={pdfUrl} />
              </div>
            ) : (
              <div className="h-full bg-gray-50 rounded border border-gray-200">
                <div className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{xmlContent}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
