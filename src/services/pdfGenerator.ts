import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class PDFGenerator {
  private static instance: PDFGenerator;
  private constructor() {}

  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  async generatePDF(xmlContent: string): Promise<string> {
    try {
      // Create temporary files
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aitdw-'));
      const xmlPath = path.join(tempDir, 'input.xml');
      const pdfPath = path.join(tempDir, 'output.pdf');
      const xslPath = path.join(process.cwd(), 'public', 'styles', 'document.xsl');

      // Write XML content to temp file
      await fs.writeFile(xmlPath, xmlContent);

      // Generate PDF using PrinceXML
      await new Promise((resolve, reject) => {
        const prince = spawn('prince', [
          xmlPath,
          '-s',
          xslPath,
          '-o',
          pdfPath,
          '--javascript'
        ]);

        prince.stderr.on('data', (data) => {
          console.error(`Prince Error: ${data}`);
        });

        prince.on('close', (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(`Prince process exited with code ${code}`));
          }
        });
      });

      // Read the generated PDF
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // Clean up temp files
      await fs.rm(tempDir, { recursive: true });

      // Return base64 encoded PDF
      return pdfBuffer.toString('base64');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }
}
