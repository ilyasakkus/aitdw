'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import XMLEditor from '@/components/Editor/XMLEditor';

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

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  // Only show loading state on initial load
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
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">XML Editor</h1>
          <div className="h-[600px]">
            <XMLEditor 
              value={xmlContent}
              onChange={setXmlContent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
