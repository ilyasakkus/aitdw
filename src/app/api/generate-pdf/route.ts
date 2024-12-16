import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator } from '@/services/pdfGenerator';

export async function POST(req: NextRequest) {
  try {
    const { xmlContent } = await req.json();

    if (!xmlContent) {
      return NextResponse.json(
        { error: 'XML content is required' },
        { status: 400 }
      );
    }

    const pdfGenerator = PDFGenerator.getInstance();
    const pdfBase64 = await pdfGenerator.generatePDF(xmlContent);

    return NextResponse.json({ pdf: pdfBase64 });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
