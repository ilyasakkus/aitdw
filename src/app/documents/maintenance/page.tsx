'use client';

import DocumentLayout from '@/components/Documents/DocumentLayout';

const defaultMaintenanceXML = `<?xml version="1.0" encoding="UTF-8"?>
<dmodule>
  <identAndStatusSection>
    <dmAddress>
      <dmIdent>
        <dmCode modelIdentCode="DEMO" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="A" infoCode="300" infoCodeVariant="A" itemLocationCode="C"/>
        <language languageIsoCode="en" countryIsoCode="US"/>
        <issueInfo issueNumber="000" inWork="01"/>
      </dmIdent>
      <dmAddressItems>
        <issueDate year="2024" month="01" day="01"/>
        <dmTitle>
          <techName>Maintenance Procedures</techName>
          <infoName>Scheduled Maintenance</infoName>
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
    <scheduledMaintenance>
      <taskDefinition>
        <taskDescr>Regular Maintenance Check</taskDescr>
        <taskDuration>2.0</taskDuration>
        <personnelRequired>
          <personnel man="1" personType="Technician"/>
        </personnelRequired>
      </taskDefinition>
      <preliminaryRqmts>
        <reqCondGroup>
          <reqCondNoRef>
            <reqCond>Equipment powered down</reqCond>
          </reqCondNoRef>
        </reqCondGroup>
      </preliminaryRqmts>
      <mainProcedure>
        <proceduralStep>
          <para>Inspection Steps</para>
          <proceduralStep>
            <para>Check all connections</para>
          </proceduralStep>
          <proceduralStep>
            <para>Verify system integrity</para>
          </proceduralStep>
        </proceduralStep>
      </mainProcedure>
    </scheduledMaintenance>
  </content>
</dmodule>`;

export default function MaintenancePage() {
  return (
    <DocumentLayout
      title="Maintenance Documents"
      category="Technical Documentation"
      defaultXML={defaultMaintenanceXML}
    />
  );
}
