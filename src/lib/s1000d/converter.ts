export function convertToS1000D(content: string): string {
  // Convert HTML content to S1000D XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<dmodule>\n';
  xml += '  <identAndStatusSection>\n';
  xml += '    <dmAddress>\n';
  xml += '      <dmIdent>\n';
  xml += '        <dmCode modelIdentCode="MYPRJ" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="A" infoCode="040" infoCodeVariant="A" itemLocationCode="A"/>\n';
  xml += '      </dmIdent>\n';
  xml += '    </dmAddress>\n';
  xml += '  </identAndStatusSection>\n';
  xml += '  <content>\n';
  xml += '    <description>\n';
  
  // Convert content
  function processNode(node: Node): string {
    let result = '';
    
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        const element = node as Element;
        switch (element.tagName.toLowerCase()) {
          case 'p':
            result += '      <para>';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '</para>\n';
            break;
            
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            const level = parseInt(element.tagName[1]);
            result += `      <title${level}>`;
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += `</title${level}>\n`;
            break;
            
          case 'ul':
            result += '      <randlist>\n';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '      </randlist>\n';
            break;
            
          case 'ol':
            result += '      <seqlist>\n';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '      </seqlist>\n';
            break;
            
          case 'li':
            result += '        <item>';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '</item>\n';
            break;
            
          case 'table':
            result += '      <table>\n';
            result += '        <tgroup cols="' + element.getElementsByTagName('td').length + '">\n';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '        </tgroup>\n';
            result += '      </table>\n';
            break;
            
          case 'tr':
            result += '          <row>\n';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '          </row>\n';
            break;
            
          case 'td':
          case 'th':
            result += '            <entry>';
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
            result += '</entry>\n';
            break;
            
          default:
            for (const child of Array.from(element.childNodes)) {
              result += processNode(child);
            }
        }
        break;
        
      case Node.TEXT_NODE:
        result += node.textContent?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '';
        break;
    }
    
    return result;
  }
  
  // Process the body content
  const body = doc.body;
  for (const child of Array.from(body.childNodes)) {
    xml += processNode(child);
  }
  
  xml += '    </description>\n';
  xml += '  </content>\n';
  xml += '</dmodule>';
  
  return xml;
}
