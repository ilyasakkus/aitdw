'use client';

import { useState, useRef } from 'react';
import { S1000DValidator } from '@/lib/s1000d/validator';
import { BREXValidator, BREXValidationResult } from '@/lib/s1000d/brex';
import BREXValidationPanel from './BREXValidationPanel';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

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

  return (
    <div className="h-full flex flex-col">
      {/* XML Editor */}
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
            fontSize: 14,
          }}
        />
      </div>
      
      {/* Validation Results - Shown as a collapsible panel */}
      {(!validationResult.isValid || !brexResult.isValid) && (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-h-32 overflow-y-auto">
            <BREXValidationPanel validationResult={brexResult} />
            {!validationResult.isValid && (
              <div className="p-2 bg-red-50 text-red-700 text-sm">
                <h3 className="font-bold text-xs uppercase">XML Schema Validation Errors:</h3>
                <ul className="list-disc pl-4 mt-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-xs">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
