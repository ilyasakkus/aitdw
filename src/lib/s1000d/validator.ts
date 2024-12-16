import { DOMParser } from 'xmldom';
import * as libxml from 'libxmljs2';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class S1000DValidator {
  private schema: libxml.Document | null = null;

  constructor() {
    // S1000D şema dosyasını yükle
    try {
      const schemaContent = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- Temel S1000D elemanları -->
  <xs:element name="dmodule">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="identAndStatusSection" type="identAndStatusSectionType"/>
        <!-- Diğer bölümler buraya eklenecek -->
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
      <xs:element name="dmCode" type="dmCodeType"/>
      <xs:element name="language" type="languageType"/>
      <xs:element name="issueInfo" type="issueInfoType"/>
    </xs:sequence>
  </xs:complexType>

  <!-- Diğer tip tanımlamaları -->
</xs:schema>`;
      
      this.schema = libxml.parseXml(schemaContent);
    } catch (error) {
      console.error('Şema yükleme hatası:', error);
    }
  }

  public validateXML(xmlContent: string): ValidationResult {
    try {
      const xmlDoc = libxml.parseXml(xmlContent);
      
      if (!this.schema) {
        return {
          isValid: false,
          errors: ['S1000D şeması yüklenemedi']
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

  public validateDMCode(dmCode: string): boolean {
    // DMC formatı: MODEL-DIFF-SYS-SUBSYS-ASSY-DISASSY-DISVAR-INFO-INFOVAR-ITEMLOC
    const dmcPattern = /^[A-Z0-9]{1,14}-[A-Z0-9]-[0-9]{2}-[0-9]-[0-9]-[0-9]{2}-[0-9]{2}[A-Z]-[0-9]{3}-[A-Z]-[A-Z]$/;
    return dmcPattern.test(dmCode);
  }
}
