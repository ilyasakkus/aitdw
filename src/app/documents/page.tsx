'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import XMLEditor from '@/components/Editor/XMLEditor';
import PDFPreview from '@/components/Preview/PDFPreview';
import DocumentSidebar from '@/components/Editor/DocumentSidebar';
import XMLPreview from '@/components/Preview/XMLPreview';

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

// Sample chapters data structure
const chapters = [
  {
    id: '1',
    title: 'Operating Documents',
    level: 0,
    children: [
      { id: '1.1', title: 'Operating Manual 1', level: 1 },
      { id: '1.2', title: 'Operating Manual 2', level: 1 }
    ]
  },
  {
    id: '2',
    title: 'Maintenance Documents',
    level: 0,
    children: [
      { id: '2.1', title: 'Maintenance Manual 1', level: 1 },
      { id: '2.2', title: 'Maintenance Manual 2', level: 1 }
    ]
  },
  {
    id: '3',
    title: 'Parts Catalogs',
    level: 0,
    children: [
      { id: '3.1', title: 'Parts Catalog 1', level: 1 },
      { id: '3.2', title: 'Parts Catalog 2', level: 1 }
    ]
  }
];

export default function Documents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [xmlContent, setXmlContent] = useState(defaultXML);
  const [activeTab, setActiveTab] = useState<'visual' | 'xml' | 'preview'>('visual');
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    setPdfUrl('/sample.pdf');
  }, [xmlContent]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleNodeSelect = (node: any) => {
    console.log('Selected node:', node);
  };

  return (
    <div className="flex h-screen bg-gray-50 pt-6">
      {/* Sidebar */}
      <div className="h-[calc(100vh-1.5rem)]">
        <DocumentSidebar
          chapters={chapters}
          onSelectNode={handleNodeSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-1.5rem)]">
        {/* Title and Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-2">
            <h1 className="text-xl font-semibold text-gray-900">Documents Overview</h1>
            <p className="text-sm text-gray-500">View and manage all documents</p>
          </div>
          
          {/* Tab buttons */}
          <div className="px-4 pb-2 flex space-x-2">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'visual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setActiveTab('xml')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'xml'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              XML Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'preview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Editor/Preview Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'visual' && (
            <div className="h-full p-4">
              <div className="bg-white rounded-lg shadow h-full p-4">
                Visual editor content here
              </div>
            </div>
          )}
          
          {activeTab === 'xml' && (
            <div className="h-full">
              <XMLEditor value={xmlContent} onChange={setXmlContent} />
            </div>
          )}
          
          {activeTab === 'preview' && (
            <div className="h-full">
              <XMLPreview xml={xmlContent} previewType="pdf" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
