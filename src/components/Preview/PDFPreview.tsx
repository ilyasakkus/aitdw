'use client';

import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface PDFPreviewProps {
  xmlContent?: string;
  onRenderClick?: () => void;
}

export default function PDFPreview({ xmlContent, onRenderClick }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRenderClick = async () => {
    if (!xmlContent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();
      setPdfData(`data:application/pdf;base64,${data.pdf}`);
      onRenderClick?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (!xmlContent && !pdfData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No content available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-2">
          {xmlContent && !loading && (
            <button
              onClick={handleRenderClick}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Render PDF
            </button>
          )}
          {pdfData && (
            <>
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </>
          )}
        </div>
        {pdfData && (
          <>
            <div className="text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                -
              </button>
              <button
                onClick={() => setScale(Math.min(3, scale + 0.1))}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                +
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : pdfData ? (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        ) : (
          <div className="text-gray-500">Click "Render PDF" to generate the PDF</div>
        )}
      </div>
    </div>
  );
}
