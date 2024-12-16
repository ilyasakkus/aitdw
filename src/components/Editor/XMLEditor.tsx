import { Editor } from '@monaco-editor/react';
import { useState, useCallback } from 'react';
import { S1000DValidator } from '@/lib/s1000d/validator';

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

export default function XMLEditor() {
  const [value, setValue] = useState(defaultXML);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const validator = new S1000DValidator();

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value) {
      setValue(value);
      const result = validator.validateXML(value);
      setValidationResult(result);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="h-[600px] w-full">
        <Editor
          height="100%"
          defaultLanguage="xml"
          defaultValue={defaultXML}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      <div className={`mt-4 p-4 rounded-lg ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
        <h3 className="font-semibold mb-2">Validation Status:</h3>
        {validationResult.isValid ? (
          <p className="text-green-700">Document is valid</p>
        ) : (
          <div>
            <p className="text-red-700 font-semibold">Validation Errors:</p>
            <ul className="list-disc pl-5">
              {validationResult.errors.map((error, index) => (
                <li key={index} className="text-red-600">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
