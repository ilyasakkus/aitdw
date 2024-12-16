'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useRef } from 'react';
import { S1000DValidator } from '@/lib/s1000d/validator';
import { BREXValidator, BREXValidationResult } from '@/lib/s1000d/brex';
import BREXValidationPanel from './BREXValidationPanel';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

// Configure Monaco loader
loader.config({ monaco });

// Register XML language support
if (typeof window !== 'undefined') {
  monaco.languages.register({ id: 'xml' });
  monaco.languages.setMonarchTokensProvider('xml', {
    defaultToken: '',
    tokenPostfix: '.xml',

    // Brackets and tags
    brackets: [
      { token: 'delimiter.bracket', open: '{', close: '}' },
      { token: 'delimiter.angle', open: '<', close: '>' },
      { token: 'delimiter.bracket', open: '[', close: ']' },
      { token: 'delimiter.bracket', open: '(', close: ')' },
    ],

    // XML tags
    tags: [],

    // Regular expressions
    tokenizer: {
      root: [
        [/[^<&]+/, ''],
        { include: '@whitespace' },
        [/(<)(@tags)/, ['delimiter.angle', { token: 'tag', next: '@tag.$2' }]],
        [/(<\/)(@tags)(>)/, ['delimiter.angle', 'tag', { token: 'delimiter.angle', next: '@pop' }]],
        [/(<)([:\w]+)/, ['delimiter.angle', { token: 'tag', next: '@tag.$2' }]],
        [/(<\/)([:\w]+)(>)/, ['delimiter.angle', 'tag', { token: 'delimiter.angle', next: '@pop' }]],
        [/(<!\[CDATA\[)/, 'delimiter.cdata', '@cdata'],
        [/(<!\-\-)/, 'comment', '@comment'],
        [/(<\?)(\w+)/, ['delimiter.xml', 'tag', '@tag.$2']],
        [/[<&]/, '']
      ],
      tag: [
        [/[ \t\r\n]+/, ''],
        [/(type|version|encoding)?(=)/, ['attribute.name', 'delimiter']],
        [/"([^"]*)"/, 'attribute.value'],
        [/'([^']*)'/, 'attribute.value'],
        [/[\w\-]+/, 'attribute.name'],
        [/\/>/, 'delimiter.angle', '@pop'],
        [/>/, { token: 'delimiter.angle', next: '@pop' }]
      ],
      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/<!--/, 'comment', '@comment']
      ],
      comment: [
        [/[^<\-]+/, 'comment.content'],
        [/-->/, 'comment', '@pop'],
        [/<!--/, 'comment.content.invalid'],
        [/[<\-]/, 'comment.content']
      ],
      cdata: [
        [/[^\]]+/, 'cdata'],
        [/\]\]>/, 'delimiter.cdata', '@pop'],
        [/./, 'cdata']
      ]
    }
  });
}

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

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      // Initialize Monaco editor
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: value,
        language: 'xml',
        theme: 'vs-light',
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingIndent: 'indent',
        formatOnPaste: true,
        formatOnType: true,
        rulers: [80],
        folding: true,
        renderWhitespace: 'boundary',
        contextmenu: true,
        fontSize: 14,
        lineNumbers: 'on',
        lineHeight: 20,
        renderLineHighlight: 'all',
        scrollbar: {
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12,
        },
      });

      // Add S1000D XML schema
      monaco.editor.getModels().forEach(model => model.dispose());
      const xmlDefaults = monaco.languages.getLanguages()
        .find(lang => lang.id === 'xml')
        ?.configuration;
      
      if (xmlDefaults) {
        monaco.languages.registerDocumentFormattingEditProvider('xml', {
          provideDocumentFormattingEdits: (model) => {
            // Basic XML formatting can be added here if needed
            return [];
          }
        });
      }

      // Set language configuration using Monaco languages API
      monaco.languages.setLanguageConfiguration('xml', {
        brackets: [
          ['<', '>']
        ],
        autoClosingPairs: [
          { open: '<', close: '>' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      });

      // Set XML schema configuration
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        schemas: [{
          uri: 'http://www.s1000d.org/S1000D_4-1/xml_schema_flat/descript.xsd',
          schema: S1000D_XML_SCHEMA,
          fileMatch: ['*']
        }]
      });

      // Handle content changes
      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue() || '';
        onChange(newValue);
        
        // XML Schema validation
        validator.validateXML(newValue).then(validationResult => {
          setValidationResult(validationResult);
        });

        // BREX validation
        const brexResult = brexValidator.validate(newValue);
        setBrexResult(brexResult);
      });
    }

    return () => {
      editorRef.current?.dispose();
    };
  }, [value, onChange]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">XML Editor</h2>
      </div>
      <div ref={containerRef} className="flex-1" />
      
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
