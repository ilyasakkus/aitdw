import React from 'react';
import { XMLParser } from 'fast-xml-parser';
import { Editor } from '@monaco-editor/react';

interface XMLPreviewProps {
  xml: string;
  previewType?: 'pdf' | 'xml';
  className?: string;
}

export default function XMLPreview({ xml, previewType }: XMLPreviewProps) {
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

  return (
    <div className="h-full w-full">
      {previewType === 'pdf' ? (
        <div className="h-full w-full">
          <div className="bg-gray-100 p-8 h-full flex justify-center items-start overflow-auto">
            <div 
              className="bg-white shadow-lg w-[210mm] min-h-[297mm]" 
              style={{ 
                padding: '21mm 30mm',
                margin: '0 auto',
              }}
            >
              <div className="prose max-w-none">
                {xml ? (
                  <>
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold">Teknik Doküman</h1>
                      <div className="text-gray-600">S1000D Önizleme</div>
                    </div>
                    <div className="space-y-4">
                      {/* Add structured content parsing here */}
                      <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                        {formatXML(xml)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    Önizleme için içerik bulunamadı
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full bg-white overflow-auto p-4">
          <Editor
            height="100%"
            defaultLanguage="xml"
            value={xml}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              theme: 'vs-light'
            }}
          />
        </div>
      )}
    </div>
  );
}
