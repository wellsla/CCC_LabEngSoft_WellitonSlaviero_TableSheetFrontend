
/**
 * Represents a PDF document.
 */
export interface PdfDocument {
  /**
   * The unique identifier for the PDF document.
   */
  id: string;
  /**
   * The name of the PDF document.
   */
  name: string;
  /**
   * The direct URL to the PDF file.
   */
  url: string;
  /**
   * The identifier of the game this PDF belongs to.
   */
  gameId: string;
}

// Mock data for PDF documents
// Using publicly available PDF samples for demonstration
const allPdfDocuments: PdfDocument[] = [
  {
    id: 'dnd5e-basic-rules',
    name: 'D&D 5e Basic Rules',
    url: 'https://media.wizards.com/2014/downloads/dnd/Playerstd_BasicRules_v0.2.pdf',
    gameId: '3', // Corresponds to "Dungeons & Dragons 5e" in mock game data
  },
  {
    id: 'dnd5e-srd',
    name: 'D&D 5e SRD',
    url: 'https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf',
    gameId: '3', // Corresponds to "Dungeons & Dragons 5e"
  },
  {
    id: 'dummy-pdf-checkers',
    name: 'Dummy PDF (for Checkers)',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    gameId: '2', // Corresponds to "Checkers" in mock game data
  },
  {
    id: 'another-dummy-pdf',
    name: 'Another Dummy PDF (General)',
    url: 'https://pdfobject.com/pdf/sample.pdf',
    gameId: 'generic', // Not tied to a specific game in mock
  },
];

/**
 * Asynchronously retrieves a list of PDF documents for a specific game.
 *
 * @param gameId The unique identifier of the game.
 * @returns A promise that resolves to an array of PdfDocument objects.
 */
export async function getPdfDocumentsForGame(
  gameId: string
): Promise<PdfDocument[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200));
  return allPdfDocuments.filter((doc) => doc.gameId === gameId);
}

/**
 * Asynchronously retrieves the details of a specific PDF document.
 *
 * @param pdfId The unique identifier of the PDF document.
 * @param gameId Optional: The unique identifier of the game, for context or if IDs aren't globally unique.
 * @returns A promise that resolves to a PdfDocument object or null if not found.
 */
export async function getPdfDocumentDetails(
  pdfId: string,
  gameId?: string
): Promise<PdfDocument | null> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  const doc = allPdfDocuments.find(
    (d) => d.id === pdfId && (gameId ? d.gameId === gameId : true)
  );
  return doc || null;
}
