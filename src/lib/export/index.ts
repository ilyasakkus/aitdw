export const exportToHTML = (xml: string): string => {
  try {
    const parser = new DOMParser();
    const xsltProcessor = new XSLTProcessor();
    
    // Basic XSLT template for S1000D to HTML conversion
    const xsltTemplate = `
      <?xml version="1.0" encoding="UTF-8"?>
      <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
        <xsl:template match="/">
          <html>
            <head>
              <title>
                <xsl:value-of select="//dmTitle/techName"/> - 
                <xsl:value-of select="//dmTitle/infoName"/>
              </title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .tech-name { font-size: 24px; font-weight: bold; }
                .info-name { font-size: 18px; color: #666; }
                .section { margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="tech-name">
                  <xsl:value-of select="//dmTitle/techName"/>
                </div>
                <div class="info-name">
                  <xsl:value-of select="//dmTitle/infoName"/>
                </div>
              </div>
              <div class="metadata section">
                <p>Issue Date: <xsl:value-of select="//issueDate/@year"/>-<xsl:value-of select="//issueDate/@month"/>-<xsl:value-of select="//issueDate/@day"/></p>
                <p>Issue: <xsl:value-of select="//issueInfo/@issueNumber"/></p>
                <p>Language: <xsl:value-of select="//language/@languageIsoCode"/>-<xsl:value-of select="//language/@countryIsoCode"/></p>
              </div>
              <div class="content section">
                <xsl:apply-templates/>
              </div>
            </body>
          </html>
        </xsl:template>
      </xsl:stylesheet>
    `;

    const xsltDoc = parser.parseFromString(xsltTemplate, 'text/xml');
    xsltProcessor.importStylesheet(xsltDoc);

    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    
    return new XMLSerializer().serializeToString(resultDoc);
  } catch (error) {
    console.error('Error converting to HTML:', error);
    throw new Error('Failed to convert XML to HTML');
  }
};

export const downloadAsFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
