import { XMLParser } from 'fast-xml-parser';

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
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true,
      preserveOrder: true
    });
  }

  loadRules(brexXml: string) {
    try {
      const doc = this.parser.parse(brexXml);
      this.rules = this.extractRules(doc);
    } catch (error) {
      console.error('Error loading BREX rules:', error);
      this.rules = [];
    }
  }

  private extractRules(doc: any[]): BREXRule[] {
    const rules: BREXRule[] = [];
    
    // Find the contextRules element in the parsed document
    const contextRules = this.findContextRules(doc);
    if (!contextRules) return rules;

    // Extract rules from the contextRules
    const structureObjectRules = this.findStructureObjectRules(contextRules);
    if (!structureObjectRules) return rules;

    // Process each rule
    for (const ruleNode of structureObjectRules) {
      if (Array.isArray(ruleNode.objectPath)) {
        for (const objectPath of ruleNode.objectPath) {
          const rule = this.createRule(objectPath, ruleNode);
          if (rule) rules.push(rule);
        }
      }
    }

    return rules;
  }

  private findContextRules(doc: any[]): any {
    for (const node of doc) {
      if (node.dmodule) {
        const content = node.dmodule.find((n: any) => n.content);
        if (content) {
          const brex = content.find((n: any) => n.brex);
          if (brex) {
            return brex.find((n: any) => n.contextRules);
          }
        }
      }
    }
    return null;
  }

  private findStructureObjectRules(contextRules: any): any[] {
    for (const rule of contextRules) {
      if (rule.structureObjectRuleGroup) {
        return rule.structureObjectRuleGroup;
      }
    }
    return [];
  }

  private createRule(objectPath: any, ruleNode: any): BREXRule | null {
    if (!objectPath || !objectPath['#text']) return null;

    return {
      id: objectPath['@_id'] || '',
      severity: this.determineSeverity(ruleNode),
      context: objectPath['#text'],
      message: this.extractMessage(ruleNode)
    };
  }

  private determineSeverity(ruleNode: any): 'error' | 'warning' | 'info' {
    if (ruleNode.objectUse && ruleNode.objectUse[0]) {
      const severity = ruleNode.objectUse[0]['@_verificationType'];
      switch (severity) {
        case 'error':
          return 'error';
        case 'warning':
          return 'warning';
        default:
          return 'info';
      }
    }
    return 'info';
  }

  private extractMessage(ruleNode: any): string {
    if (ruleNode.objectUse && 
        ruleNode.objectUse[0] && 
        ruleNode.objectUse[0].objectValue && 
        ruleNode.objectUse[0].objectValue[0]) {
      return ruleNode.objectUse[0].objectValue[0]['#text'] || '';
    }
    return '';
  }

  validate(xml: string): BREXValidationResult {
    const result: BREXValidationResult = {
      isValid: true,
      violations: []
    };

    try {
      const doc = this.parser.parse(xml);
      
      for (const rule of this.rules) {
        const matches = this.evaluateXPath(doc, rule.context);
        if (matches.length > 0) {
          result.isValid = rule.severity !== 'error';
          result.violations.push({
            rule,
            location: matches[0]
          });
        }
      }
    } catch (error) {
      console.error('Error validating against BREX:', error);
      result.isValid = false;
      result.violations.push({
        rule: {
          id: 'parse-error',
          severity: 'error',
          context: '',
          message: 'Failed to parse XML document'
        },
        location: ''
      });
    }

    return result;
  }

  private evaluateXPath(doc: any, xpath: string): string[] {
    // Simple XPath-like evaluation
    const parts = xpath.split('/').filter(p => p);
    let current: any = doc;
    const results: string[] = [];

    try {
      for (const part of parts) {
        if (!current) break;
        
        if (Array.isArray(current)) {
          current = current.find(node => node[part]);
          if (current) current = current[part];
        } else {
          current = current[part];
        }
      }

      if (current) {
        results.push(xpath);
      }
    } catch (error) {
      console.error('XPath evaluation error:', error);
    }

    return results;
  }
}
