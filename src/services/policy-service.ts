'use server';

import { storage } from '@/lib/firebase';
import { ref, listAll, getBytes } from 'firebase/storage';
import PDFParser from 'pdf2json';

export interface Policy {
  id: string;
  title: string;
  content: string;
}

async function parsePdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', () => {
            resolve((pdfParser as any).getRawTextContent());
        });
        pdfParser.parseBuffer(buffer);
    });
}


export async function getPolicies(): Promise<Policy[]> {
  try {
    const policiesRef = ref(storage, 'policies');
    const policySnapshot = await listAll(policiesRef);
    
    const policies = await Promise.all(
      policySnapshot.items.map(async (itemRef) => {
        const bytes = await getBytes(itemRef);
        const buffer = Buffer.from(bytes);
        const title = itemRef.name.replace(/\.[^/.]+$/, "");
        let content = '';

        if (itemRef.name.toLowerCase().endsWith('.pdf')) {
          try {
            content = await parsePdf(buffer);
          } catch (error) {
            console.error(`Error parsing PDF ${itemRef.name}:`, error);
            content = `(Could not parse the content of PDF file: ${itemRef.name})`;
          }
        } else {
          // For text-based files
          content = buffer.toString('utf-8');
        }

        return {
          id: itemRef.name,
          title: title,
          content: content,
        };
      })
    );
    
    return policies;
  } catch (error) {
    console.error("Error fetching policies from storage:", error);
    // If the 'policies/' directory doesn't exist, Storage throws an error.
    // We'll return an empty array in that case.
    return [];
  }
}
