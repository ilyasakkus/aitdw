import { useState } from 'react';

const templates = {
  'procedural': `<?xml version="1.0" encoding="UTF-8"?>
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
          <techName>Maintenance Procedure</techName>
          <infoName>Description</infoName>
        </dmTitle>
      </dmAddressItems>
    </dmAddress>
    <dmStatus>
      <security securityClassification="01"/>
      <responsiblePartnerCompany/>
      <originator/>
      <applic>
        <displayText>
          <simplePara>All</simplePara>
        </displayText>
      </applic>
      <brexDmRef>
        <dmRef>
          <dmRefIdent>
            <dmCode modelIdentCode="S1000D" systemDiffCode="G" systemCode="04" subSystemCode="1" subSubSystemCode="0" assyCode="0300" disassyCode="00" disassyCodeVariant="A" infoCode="022" infoCodeVariant="A" itemLocationCode="D"/>
          </dmRefIdent>
        </dmRef>
      </brexDmRef>
      <qualityAssurance>
        <unverified/>
      </qualityAssurance>
    </dmStatus>
  </identAndStatusSection>
  <content>
    <procedure>
      <preliminaryRqmts>
        <reqCondGroup>
          <reqCondNoRef>
            <reqCond>Required conditions go here</reqCond>
          </reqCondNoRef>
        </reqCondGroup>
        <reqPersons>
          <reqPerson man="1" personType="Maintainer"/>
        </reqPersons>
        <reqTechInfoGroup>
          <reqTechInfo>Required technical information goes here</reqTechInfo>
        </reqTechInfoGroup>
        <reqSupportEquips>
          <reqSupportEquip>
            <supportEquipDescr>Required support equipment goes here</supportEquipDescr>
          </reqSupportEquip>
        </reqSupportEquips>
        <reqSupplies>
          <reqSupply>
            <supplyDescr>Required supplies go here</supplyDescr>
          </reqSupply>
        </reqSupplies>
        <reqSpares>
          <reqSpare>
            <spareDescr>Required spares go here</spareDescr>
          </reqSpare>
        </reqSpares>
        <reqSafety>
          <safetyRqmts>Safety requirements go here</safetyRqmts>
        </reqSafety>
      </preliminaryRqmts>
      <mainProcedure>
        <proceduralStep>
          <para>First step of the procedure</para>
        </proceduralStep>
        <proceduralStep>
          <para>Second step of the procedure</para>
        </proceduralStep>
      </mainProcedure>
      <closeRqmts>
        <reqCondGroup>
          <reqCondNoRef>
            <reqCond>Close-up requirements go here</reqCond>
          </reqCondNoRef>
        </reqCondGroup>
      </closeRqmts>
    </procedure>
  </content>
</dmodule>`,
  'descriptive': `<?xml version="1.0" encoding="UTF-8"?>
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
          <techName>System Description</techName>
          <infoName>Description</infoName>
        </dmTitle>
      </dmAddressItems>
    </dmAddress>
    <dmStatus>
      <security securityClassification="01"/>
      <responsiblePartnerCompany/>
      <originator/>
      <applic>
        <displayText>
          <simplePara>All</simplePara>
        </displayText>
      </applic>
      <brexDmRef>
        <dmRef>
          <dmRefIdent>
            <dmCode modelIdentCode="S1000D" systemDiffCode="G" systemCode="04" subSystemCode="1" subSubSystemCode="0" assyCode="0300" disassyCode="00" disassyCodeVariant="A" infoCode="022" infoCodeVariant="A" itemLocationCode="D"/>
          </dmRefIdent>
        </dmRef>
      </brexDmRef>
      <qualityAssurance>
        <unverified/>
      </qualityAssurance>
    </dmStatus>
  </identAndStatusSection>
  <content>
    <description>
      <levelledPara>
        <title>General</title>
        <para>General description goes here</para>
      </levelledPara>
      <levelledPara>
        <title>Description</title>
        <para>Detailed description goes here</para>
        <levelledPara>
          <title>Component 1</title>
          <para>Description of component 1</para>
        </levelledPara>
        <levelledPara>
          <title>Component 2</title>
          <para>Description of component 2</para>
        </levelledPara>
      </levelledPara>
    </description>
  </content>
</dmodule>`
};

interface TemplateSelectorProps {
  onSelect: (xml: string) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates | ''>('');

  const handleTemplateChange = (template: keyof typeof templates) => {
    setSelectedTemplate(template);
    onSelect(templates[template]);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Template
      </label>
      <div className="flex gap-2">
        {Object.keys(templates).map((template) => (
          <button
            key={template}
            className={`px-4 py-2 rounded ${
              selectedTemplate === template
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleTemplateChange(template as keyof typeof templates)}
          >
            {template.charAt(0).toUpperCase() + template.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
