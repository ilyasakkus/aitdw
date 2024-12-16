'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { S1000DValidator } from '@/lib/s1000d/validator';
import { BREXValidator, BREXValidationResult } from '@/lib/s1000d/brex';
import BREXValidationPanel from './BREXValidationPanel';

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

interface XMLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Monaco Editor'ı dynamic olarak import ediyoruz
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  { ssr: false } // Server-side rendering'i devre dışı bırakıyoruz
);

export default function XMLEditor({ value, onChange }: XMLEditorProps) {
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [brexResult, setBrexResult] = useState<BREXValidationResult>({ isValid: true, violations: [] });
  
  const validator = new S1000DValidator();
  const brexValidator = new BREXValidator();

  const handleEditorChange = useCallback(async (newValue: string | undefined) => {
    if (newValue) {
      onChange(newValue);
      
      // XML Schema validation
      const validationResult = await validator.validateXML(newValue);
      setValidationResult(validationResult);

      // BREX validation
      const brexResult = await brexValidator.validate(newValue);
      setBrexResult(brexResult);
    }
  }, [onChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[800px] bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="h-full" style={{ padding: '21mm 30mm', backgroundColor: 'white' }}>
          <MonacoEditor
            height="100%"
            defaultLanguage="xml"
            value={value}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              wrappingStrategy: 'advanced',
              fontSize: 14,
              fontFamily: 'Arial',
              theme: 'vs-light'
            }}
          />
        </div>
      </div>
      
      {/* Validation Results */}
      <div className="mt-4">
        <BREXValidationPanel validationResult={brexResult} />
        {!validationResult.isValid && (
          <div className="mt-2 p-4 bg-red-50 text-red-700 rounded">
            <h3 className="font-bold">XML Schema Validation Errors:</h3>
            <ul className="list-disc pl-5">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
