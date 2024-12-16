import { parseString } from 'xml2js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class S1000DValidator {
  validateXML(xml: string): Promise<ValidationResult> {
    return new Promise((resolve) => {
      parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) {
          resolve({
            isValid: false,
            errors: [err.message]
          });
          return;
        }

        try {
          // Basic structure validation
          if (!result.dmodule) {
            resolve({
              isValid: false,
              errors: ['Root element must be dmodule']
            });
            return;
          }

          const dmodule = result.dmodule;
          if (!dmodule.identAndStatusSection) {
            resolve({
              isValid: false,
              errors: ['Missing identAndStatusSection']
            });
            return;
          }

          const identAndStatusSection = dmodule.identAndStatusSection;
          if (!identAndStatusSection.dmAddress) {
            resolve({
              isValid: false,
              errors: ['Missing dmAddress in identAndStatusSection']
            });
            return;
          }

          const dmAddress = identAndStatusSection.dmAddress;
          if (!dmAddress.dmIdent) {
            resolve({
              isValid: false,
              errors: ['Missing dmIdent in dmAddress']
            });
            return;
          }

          resolve({
            isValid: true,
            errors: []
          });
        } catch (error) {
          resolve({
            isValid: false,
            errors: [(error as Error).message]
          });
        }
      });
    });
  }
}
