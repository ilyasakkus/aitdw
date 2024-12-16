import { DOMParser } from 'xmldom';

export interface BREXRule {
  id: string;
  severity: 'error' | 'warning' | 'info';
  context: string;
  message: string;
}

export interface BREXValidationResult {
  isValid: boolean;
  violations: {
    rule: BREXRule;
    location: string;
  }[];
}

export class BREXValidator {
  private rules: BREXRule[] = [];
  private parser = new DOMParser();

  constructor() {
    // Örnek BREX kuralları
    this.rules = [
      {
        id: 'BREX-001',
        severity: 'error',
        context: '//dmTitle/techName',
        message: 'Technical name must not exceed 64 characters'
      },
      {
        id: 'BREX-002',
        severity: 'error',
        context: '//dmCode/@modelIdentCode',
        message: 'Model identifier code must be between 1 and 14 characters'
      },
      {
        id: 'BREX-003',
        severity: 'warning',
        context: '//issueDate',
        message: 'Issue date should not be in the future'
      },
      {
        id: 'BREX-004',
        severity: 'error',
        context: '//language/@languageIsoCode',
        message: 'Language code must be a valid ISO 639-1 code'
      }
    ];
  }

  public loadBREXRules(brexContent: string): void {
    try {
      const doc = this.parser.parseFromString(brexContent, 'text/xml');
      // BREX dosyasından kuralları parse et
      // Bu örnek için statik kuralları kullanıyoruz
    } catch (error) {
      console.error('BREX rules loading error:', error);
    }
  }

  public validate(xmlContent: string): BREXValidationResult {
    const violations: { rule: BREXRule; location: string; }[] = [];
    try {
      const doc = this.parser.parseFromString(xmlContent, 'text/xml');

      // Her kuralı kontrol et
      this.rules.forEach(rule => {
        switch (rule.id) {
          case 'BREX-001':
            this.validateTechNameLength(doc, rule, violations);
            break;
          case 'BREX-002':
            this.validateModelIdentCode(doc, rule, violations);
            break;
          case 'BREX-003':
            this.validateIssueDate(doc, rule, violations);
            break;
          case 'BREX-004':
            this.validateLanguageCode(doc, rule, violations);
            break;
        }
      });

      return {
        isValid: violations.length === 0,
        violations
      };
    } catch (error) {
      return {
        isValid: false,
        violations: [{
          rule: {
            id: 'BREX-ERROR',
            severity: 'error',
            context: 'document',
            message: `XML parsing error: ${(error as Error).message}`
          },
          location: 'document'
        }]
      };
    }
  }

  private validateTechNameLength(doc: Document, rule: BREXRule, violations: any[]): void {
    const techNames = doc.getElementsByTagName('techName');
    for (let i = 0; i < techNames.length; i++) {
      const techName = techNames[i];
      if (techName.textContent && techName.textContent.length > 64) {
        violations.push({
          rule,
          location: `techName[${i}]`
        });
      }
    }
  }

  private validateModelIdentCode(doc: Document, rule: BREXRule, violations: any[]): void {
    const dmCodes = doc.getElementsByTagName('dmCode');
    for (let i = 0; i < dmCodes.length; i++) {
      const modelIdentCode = dmCodes[i].getAttribute('modelIdentCode');
      if (!modelIdentCode || modelIdentCode.length < 1 || modelIdentCode.length > 14) {
        violations.push({
          rule,
          location: `dmCode[${i}]`
        });
      }
    }
  }

  private validateIssueDate(doc: Document, rule: BREXRule, violations: any[]): void {
    const issueDates = doc.getElementsByTagName('issueDate');
    for (let i = 0; i < issueDates.length; i++) {
      const issueDate = issueDates[i];
      const year = parseInt(issueDate.getAttribute('year') || '0');
      const month = parseInt(issueDate.getAttribute('month') || '0') - 1;
      const day = parseInt(issueDate.getAttribute('day') || '0');
      
      const date = new Date(year, month, day);
      if (date > new Date()) {
        violations.push({
          rule,
          location: `issueDate[${i}]`
        });
      }
    }
  }

  private validateLanguageCode(doc: Document, rule: BREXRule, violations: any[]): void {
    const validLanguageCodes = ['en', 'fr', 'de', 'es', 'it']; // Örnek liste
    const languages = doc.getElementsByTagName('language');
    for (let i = 0; i < languages.length; i++) {
      const languageCode = languages[i].getAttribute('languageIsoCode');
      if (!languageCode || !validLanguageCodes.includes(languageCode.toLowerCase())) {
        violations.push({
          rule,
          location: `language[${i}]`
        });
      }
    }
  }
}
