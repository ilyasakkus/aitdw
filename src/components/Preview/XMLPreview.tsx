import { Editor } from '@monaco-editor/react';

interface XMLPreviewProps {
  xml: string;
}

export default function XMLPreview({ xml }: XMLPreviewProps) {
  // Format XML with proper indentation
  const formatXML = (xmlString: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDoc)
        .replace(/></g, '>\n<')
        .split('\n')
        .map(line => {
          const indent = line.match(/^\s*/)?.at(0) ?? '';
          const depth = (line.match(/\/\//g) || []).length;
          return ' '.repeat(depth * 2) + line.trim();
        })
        .join('\n');
    } catch (error) {
      console.error('Error formatting XML:', error);
      return xmlString;
    }
  };

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
}
