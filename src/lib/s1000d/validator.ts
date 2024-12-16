import * as libxml from 'libxmljs2';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class S1000DValidator {
  private schema: libxml.Document | null = null;

  constructor() {
    try {
      const schemaContent = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="dmodule">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="identAndStatusSection" type="identAndStatusSectionType"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:complexType name="identAndStatusSectionType">
    <xs:sequence>
      <xs:element name="dmAddress" type="dmAddressType"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="dmAddressType">
    <xs:sequence>
      <xs:element name="dmIdent" type="dmIdentType"/>
      <xs:element name="dmAddressItems" type="dmAddressItemsType"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="dmIdentType">
    <xs:sequence>
      <xs:element name="dmCode">
        <xs:complexType>
          <xs:attribute name="modelIdentCode" type="xs:string" use="required"/>
          <xs:attribute name="systemDiffCode" type="xs:string" use="required"/>
          <xs:attribute name="systemCode" type="xs:string" use="required"/>
          <xs:attribute name="subSystemCode" type="xs:string" use="required"/>
          <xs:attribute name="subSubSystemCode" type="xs:string" use="required"/>
          <xs:attribute name="assyCode" type="xs:string" use="required"/>
          <xs:attribute name="disassyCode" type="xs:string" use="required"/>
          <xs:attribute name="disassyCodeVariant" type="xs:string" use="required"/>
          <xs:attribute name="infoCode" type="xs:string" use="required"/>
          <xs:attribute name="infoCodeVariant" type="xs:string" use="required"/>
          <xs:attribute name="itemLocationCode" type="xs:string" use="required"/>
        </xs:complexType>
      </xs:element>
      <xs:element name="language">
        <xs:complexType>
          <xs:attribute name="languageIsoCode" type="xs:string" use="required"/>
          <xs:attribute name="countryIsoCode" type="xs:string" use="required"/>
        </xs:complexType>
      </xs:element>
      <xs:element name="issueInfo">
        <xs:complexType>
          <xs:attribute name="issueNumber" type="xs:string" use="required"/>
          <xs:attribute name="inWork" type="xs:string" use="required"/>
        </xs:complexType>
      </xs:element>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="dmAddressItemsType">
    <xs:sequence>
      <xs:element name="issueDate">
        <xs:complexType>
          <xs:attribute name="year" type="xs:string" use="required"/>
          <xs:attribute name="month" type="xs:string" use="required"/>
          <xs:attribute name="day" type="xs:string" use="required"/>
        </xs:complexType>
      </xs:element>
      <xs:element name="dmTitle">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="techName" type="xs:string"/>
            <xs:element name="infoName" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:sequence>
  </xs:complexType>
</xs:schema>`;

      this.schema = libxml.parseXml(schemaContent);
    } catch (error) {
      console.error('Error loading schema:', error);
      this.schema = null;
    }
  }

  validateXML(xml: string): ValidationResult {
    try {
      const xmlDoc = libxml.parseXml(xml);
      
      if (!this.schema) {
        return {
          isValid: false,
          errors: ['Schema not loaded']
        };
      }

      const isValid = xmlDoc.validate(this.schema);
      if (!isValid) {
        return {
          isValid: false,
          errors: xmlDoc.validationErrors.map(error => error.message)
        };
      }

      return {
        isValid: true,
        errors: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }
}
