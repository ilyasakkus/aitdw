<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <!-- Root template -->
  <xsl:template match="/">
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 2cm;
            font-size: 10pt;
          }
          .title {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 1cm;
          }
          .subtitle {
            font-size: 14pt;
            margin-bottom: 0.5cm;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 0.5em;
          }
          th {
            background-color: #f0f0f0;
          }
          .section {
            margin: 1cm 0;
          }
          .para {
            margin: 0.5em 0;
          }
          @page {
            size: A4;
            margin: 2cm;
            @top-center {
              content: string(doctitle);
            }
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
            }
          }
        </style>
      </head>
      <body>
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>
  
  <!-- Identity template -->
  <xsl:template match="dmodule">
    <div class="document">
      <xsl:apply-templates select="identAndStatusSection"/>
      <xsl:apply-templates select="content"/>
    </div>
  </xsl:template>
  
  <!-- Title Section -->
  <xsl:template match="dmTitle">
    <div class="title">
      <xsl:value-of select="techName"/>
    </div>
    <div class="subtitle">
      <xsl:value-of select="infoName"/>
    </div>
  </xsl:template>
  
  <!-- Content Section -->
  <xsl:template match="content">
    <div class="content">
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  
  <!-- Paragraphs -->
  <xsl:template match="para">
    <p class="para">
      <xsl:apply-templates/>
    </p>
  </xsl:template>
  
  <!-- Lists -->
  <xsl:template match="sequentialList">
    <ol>
      <xsl:apply-templates/>
    </ol>
  </xsl:template>
  
  <xsl:template match="listItem">
    <li>
      <xsl:apply-templates/>
    </li>
  </xsl:template>
  
  <!-- Tables -->
  <xsl:template match="table">
    <table>
      <xsl:apply-templates/>
    </table>
  </xsl:template>
  
  <!-- Procedures -->
  <xsl:template match="procedure">
    <div class="section">
      <h2>Procedure</h2>
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  
  <!-- Maintenance -->
  <xsl:template match="scheduledMaintenance">
    <div class="section">
      <h2>Scheduled Maintenance</h2>
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  
  <!-- Parts Catalog -->
  <xsl:template match="illustratedPartsCatalog">
    <div class="section">
      <h2>Parts Catalog</h2>
      <xsl:apply-templates/>
    </div>
  </xsl:template>
</xsl:stylesheet>
