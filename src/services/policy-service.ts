'use server';

import { firebaseAdmin, storage } from '@/lib/firebase-admin';
import { Policy } from '@/models/policy';
import PDFParser from 'pdf2json';

async function parsePdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on('pdfParser_dataError', (errData: any) =>
      reject(new Error(errData.parserError))
    );
    pdfParser.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

/**
 * Fetches policies from Firebase Storage.
 */
export async function getPolicies(): Promise<Policy[]> {
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'policies/' });

    const policies: Policy[] = await Promise.all(
      files
        .filter(file => file.name !== 'policies/') // Filter out the folder itself
        .map(async file => {
          const title = file.name
            .replace('policies/', '')
            .replace(/\.[^/.]+$/, '');
          
          const contentBuffer = (await file.download())[0];
          let content = '';

          if (file.name.toLowerCase().endsWith('.pdf')) {
            try {
              content = await parsePdf(contentBuffer);
            } catch (pdfError) {
              console.error(`Error parsing PDF file ${file.name}:`, pdfError);
              // Return a policy with an error message in the content
              return {
                id: file.name,
                title: title,
                content: `Error: Could not read the content of the PDF file "${title}". It might be corrupted or in an unsupported format.`,
              };
            }
          } else {
            content = contentBuffer.toString('utf-8');
          }
          
          return {
            id: file.name,
            title: title,
            content: content,
          };
        })
    );
    
    return policies;
  } catch (error) {
    console.error("Error fetching policies from Firebase Storage:", error);
    // Re-throw the error to be caught by the calling flow
    throw new Error(`Failed to retrieve policies from storage. Please check configuration and permissions. Error: ${(error as Error).message}`);
  }
}
