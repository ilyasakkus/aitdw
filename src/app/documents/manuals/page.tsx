'use client';

import DocumentLayout from '@/components/Documents/DocumentLayout';

const defaultManualXML = `<?xml version="1.0" encoding="UTF-8"?>
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
          <techName>User Manual</techName>
          <infoName>General Description</infoName>
        </dmTitle>
      </dmAddressItems>
    </dmAddress>
    <dmStatus>
      <security securityClassification="01"/>
      <responsiblePartnerCompany enterpriseCode="12345">
        <enterpriseName>AITDW Technical Documentation</enterpriseName>
      </responsiblePartnerCompany>
    </dmStatus>
  </identAndStatusSection>
  <content>
    <description>
      <levelledPara>
        <title>Introduction</title>
        <para>This manual provides detailed information about system operation and maintenance.</para>
      </levelledPara>
      <levelledPara>
        <title>System Overview</title>
        <para>The system consists of the following main components:</para>
        <levelledPara>
          <para>Component 1</para>
        </levelledPara>
        <levelledPara>
          <para>Component 2</para>
        </levelledPara>
      </levelledPara>
    </description>
  </content>
</dmodule>`;

export default function ManualPage() {
  return (
    <DocumentLayout
      title="User Manuals"
      category="Technical Documentation"
      defaultXML={defaultManualXML}
    />
  );
}
