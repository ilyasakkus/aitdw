import { Editor } from '@monaco-editor/react';
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

export default function XMLEditor({ value, onChange }: XMLEditorProps) {
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [brexResult, setBrexResult] = useState<BREXValidationResult>({ isValid: true, violations: [] });
  
  const validator = new S1000DValidator();
  const brexValidator = new BREXValidator();

  const handleEditorChange = useCallback(async (newValue: string | undefined) => {
    if (newValue) {
      onChange(newValue);
      
      // XML Schema validation
      const schemaResult = await validator.validateXML(newValue);
      setValidationResult(schemaResult);
      
      // BREX validation
      const brexValidation = brexValidator.validate(newValue);
      setBrexResult(brexValidation);
    }
  }, [onChange, validator, brexValidator]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="xml"
          value={value}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: 'vs-dark',
          }}
        />
      </div>
      {(!validationResult.isValid || !brexResult.isValid) && (
        <div className="bg-red-100 p-4 mt-4 rounded">
          {!validationResult.isValid && (
            <div className="text-red-700">
              <h3 className="font-bold">XML Validation Errors:</h3>
              <ul className="list-disc pl-5">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {!brexResult.isValid && (
            <BREXValidationPanel validationResult={brexResult} />
          )}
        </div>
      )}
    </div>
  );
}
