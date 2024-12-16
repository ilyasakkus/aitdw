'use client';

import DocumentLayout from '@/components/Documents/DocumentLayout';

const defaultPartsXML = `<?xml version="1.0" encoding="UTF-8"?>
<dmodule>
  <identAndStatusSection>
    <dmAddress>
      <dmIdent>
        <dmCode modelIdentCode="DEMO" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="A" infoCode="941" infoCodeVariant="A" itemLocationCode="C"/>
        <language languageIsoCode="en" countryIsoCode="US"/>
        <issueInfo issueNumber="000" inWork="01"/>
      </dmIdent>
      <dmAddressItems>
        <issueDate year="2024" month="01" day="01"/>
        <dmTitle>
          <techName>Illustrated Parts Catalog</techName>
          <infoName>Parts List</infoName>
        </dmTitle>
      </dmAddressItems>
    </dmAddress>
    <dmStatus>
      <security securityClassification="01"/>
      <responsiblePartnerCompany enterpriseCode="12345">
        <enterpriseName>AITDW Technical Documentation</enterpriseName>
      </responsiblePartnerCompany>
      <originator enterpriseCode="12345">
        <enterpriseName>AITDW Technical Documentation</enterpriseName>
      </originator>
      <applic>
        <displayText>
          <simplePara>All</simplePara>
        </displayText>
      </applic>
      <brexDmRef>
        <dmRef>
          <dmRefIdent>
            <dmCode modelIdentCode="S1000D" systemDiffCode="G" systemCode="04" subSystemCode="1" subSubSystemCode="0" assyCode="0301" disassyCode="00" disassyCodeVariant="A" infoCode="022" infoCodeVariant="A" itemLocationCode="D"/>
          </dmRefIdent>
        </dmRef>
      </brexDmRef>
      <qualityAssurance>
        <unverified/>
      </qualityAssurance>
    </dmStatus>
  </identAndStatusSection>
  <content>
    <illustratedPartsCatalog>
      <catalogSeqNumber catalogSeqNumberValue="001">
        <item>
          <catalogSeqNumberRef>
            <catalogSeqNumber catalogSeqNumberValue="001"/>
          </catalogSeqNumberRef>
          <partRef manufacturerCodeValue="12345" partNumberValue="PART-001">
            <partSegment partNumberValue="PART-001" partName="Example Part"/>
          </partRef>
          <quantity quantityValue="1"/>
        </item>
      </catalogSeqNumber>
    </illustratedPartsCatalog>
  </content>
</dmodule>`;

export default function PartsPage() {
  return (
    <DocumentLayout
      title="Illustrated Parts Catalog"
      category="Technical Documentation"
      defaultXML={defaultPartsXML}
    />
  );
}
