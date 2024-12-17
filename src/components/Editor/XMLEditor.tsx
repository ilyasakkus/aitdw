'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { S1000DValidator } from '@/lib/s1000d/validator';
import { BREXValidator, BREXValidationResult } from '@/lib/s1000d/brex';
import BREXValidationPanel from './BREXValidationPanel';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

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

const S1000D_XML_SCHEMA = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- S1000D Basic Types -->
  <xs:simpleType name="dmCode">
    <xs:restriction base="xs:string">
      <xs:pattern value="[A-Z0-9]{3}-[A-Z0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}-[A-Z]"/>
    </xs:restriction>
  </xs:simpleType>
  
  <!-- Main Elements -->
  <xs:element name="dmodule">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="identAndStatusSection" type="identAndStatusSectionType"/>
        <xs:element name="content" type="contentType"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>`;

interface XMLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function XMLEditor({ value, onChange }: XMLEditorProps) {
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [brexResult, setBrexResult] = useState<BREXValidationResult>({ isValid: true, violations: [] });
  const validator = new S1000DValidator();
  const brexValidator = new BREXValidator();
  const editorRef = useRef<any>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // XML Schema validation
    validator.validateXML(newValue).then(validationResult => {
      setValidationResult(validationResult);
    });

    // BREX validation
    const brexResult = brexValidator.validate(newValue);
    setBrexResult(brexResult);
  };

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.editor.getValue()) {
      editorRef.current.editor.setValue(value);
    }
  }, [value]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">XML Editor</h2>
      </div>
      <div className="flex-1">
        <AceEditor
          ref={editorRef}
          mode="xml"
          theme="github"
          name="xml-editor"
          value={value}
          onChange={handleChange}
          width="100%"
          height="100%"
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
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
