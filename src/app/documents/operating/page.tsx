'use client';

import DocumentLayout from '@/components/Documents/DocumentLayout';

const defaultOperatingXML = `<?xml version="1.0" encoding="UTF-8"?>
<dmodule>
  <identAndStatusSection>
    <dmAddress>
      <dmIdent>
        <dmCode modelIdentCode="DEMO" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="A" infoCode="120" infoCodeVariant="A" itemLocationCode="C"/>
        <language languageIsoCode="en" countryIsoCode="US"/>
        <issueInfo issueNumber="000" inWork="01"/>
      </dmIdent>
      <dmAddressItems>
        <issueDate year="2024" month="01" day="01"/>
        <dmTitle>
          <techName>Operating Procedures</techName>
          <infoName>Standard Operations</infoName>
        </dmTitle>
      </dmAddressItems>
    </dmAddress>
    <dmStatus>
      <security securityClassification="01"/>
      <responsiblePartnerCompany enterpriseCode="12345">
        <enterpriseName>AITDW Technical Documentation</enterpriseName>
      </responsiblePartnerCompany>
      <applic>
        <displayText>
          <simplePara>All</simplePara>
        </displayText>
      </applic>
    </dmStatus>
  </identAndStatusSection>
  <content>
    <procedure>
      <preliminaryRqmts>
        <reqCondGroup>
          <reqCondNoRef>
            <reqCond>System power OFF</reqCond>
          </reqCondNoRef>
        </reqCondGroup>
        <reqPersons>
          <reqPerson man="1" personType="Operator"/>
        </reqPersons>
        <reqTechInfoGroup/>
      </preliminaryRqmts>
      <mainProcedure>
        <proceduralStep>
          <para>Start-up Procedure</para>
          <proceduralStep>
            <para>Check system status indicators</para>
          </proceduralStep>
          <proceduralStep>
            <para>Power ON system</para>
          </proceduralStep>
        </proceduralStep>
      </mainProcedure>
    </procedure>
  </content>
</dmodule>`;

export default function OperatingPage() {
  return (
    <DocumentLayout
      title="Operating Documents"
      category="Technical Documentation"
      defaultXML={defaultOperatingXML}
    />
  );
}
