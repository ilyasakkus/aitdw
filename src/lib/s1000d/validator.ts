import { XMLParser, XMLValidator } from 'fast-xml-parser';
import * as fs from 'fs';
import path from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class S1000DValidator {
  private parser: XMLParser;
  
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true
    });
  }

  async validateXML(xml: string): Promise<ValidationResult> {
    try {
      // First validate XML syntax
      const validationResult = XMLValidator.validate(xml, {
        allowBooleanAttributes: true
      });

      if (validationResult !== true) {
        return {
          isValid: false,
          errors: [validationResult.err.msg]
        };
      }

      // Parse XML
      const result = this.parser.parse(xml);

      // Basic structure validation
      if (!result.dmodule) {
        return {
          isValid: false,
          errors: ['Root element must be dmodule']
        };
      }

      // Validate required S1000D structure
      const errors: string[] = [];
      const dmodule = result.dmodule;

      if (!dmodule.identAndStatusSection) {
        errors.push('Missing identAndStatusSection');
      } else {
        const identAndStatusSection = dmodule.identAndStatusSection;
        if (!identAndStatusSection.dmAddress) {
          errors.push('Missing dmAddress in identAndStatusSection');
        } else if (!identAndStatusSection.dmAddress.dmIdent) {
          errors.push('Missing dmIdent in dmAddress');
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }
}
