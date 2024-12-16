'use client';

import DocumentLayout from '@/components/Documents/DocumentLayout';

const defaultTrainingXML = `<?xml version="1.0" encoding="UTF-8"?>
<dmodule>
  <identAndStatusSection>
    <dmAddress>
      <dmIdent>
        <dmCode modelIdentCode="DEMO" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="00" disassyCodeVariant="A" infoCode="900" infoCodeVariant="A" itemLocationCode="C"/>
        <language languageIsoCode="en" countryIsoCode="US"/>
        <issueInfo issueNumber="000" inWork="01"/>
      </dmIdent>
      <dmAddressItems>
        <issueDate year="2024" month="01" day="01"/>
        <dmTitle>
          <techName>Training Material</techName>
          <infoName>Basic Operations Course</infoName>
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
    <learning>
      <learningPlan>
        <lcProject>
          <title>Basic Operations Training</title>
          <description>
            <para>This course provides fundamental training for system operation.</para>
          </description>
        </lcProject>
        <lcDuration>
          <title>Duration</title>
          <description>
            <para>8 hours</para>
          </description>
        </lcDuration>
      </learningPlan>
      <learningContent>
        <learningOverview>
          <title>Course Overview</title>
          <description>
            <para>Topics covered:</para>
            <sequentialList>
              <listItem>
                <para>Basic System Components</para>
              </listItem>
              <listItem>
                <para>Standard Operating Procedures</para>
              </listItem>
              <listItem>
                <para>Safety Guidelines</para>
              </listItem>
            </sequentialList>
          </description>
        </learningOverview>
      </learningContent>
    </learning>
  </content>
</dmodule>`;

export default function TrainingPage() {
  return (
    <DocumentLayout
      title="Training Documents"
      category="Technical Documentation"
      defaultXML={defaultTrainingXML}
    />
  );
}
