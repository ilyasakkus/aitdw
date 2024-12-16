import React from 'react';
import { XMLParser } from 'fast-xml-parser';
import { Editor } from '@monaco-editor/react';

interface XMLPreviewProps {
  xml: string;
  previewType?: 'pdf' | 'xml';
  className?: string;
}

const XMLPreview: React.FC<XMLPreviewProps> = ({ xml, previewType = 'pdf', className = '' }) => {
  const formatXML = (xml: string): string => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false
      });
      const obj = parser.parse(xml);
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return xml;
    }
  };

  const renderPDFPreview = () => {
    return (
      <div className="p-8 bg-white shadow-lg h-full">
        {xml ? (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold mb-6">Document Preview</h1>
            <div className="space-y-4">
              {/* Add your PDF preview components here */}
              <pre className="bg-gray-50 p-4 rounded overflow-auto">
                {formatXML(xml)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No content to preview
          </div>
        )}
      </div>
    );
  };

  const renderXMLPreview = () => {
    return (
      <div className="h-full">
        <Editor
          height="600px"
          defaultLanguage="xml"
          value={formatXML(xml)}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            folding: true,
            lineNumbers: 'on',
            wordWrap: 'on',
            theme: 'vs-dark',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    );
  };

  return (
    <div className={`overflow-auto ${className}`}>
      {previewType === 'pdf' ? renderPDFPreview() : renderXMLPreview()}
    </div>
  );
};

export default XMLPreview;
