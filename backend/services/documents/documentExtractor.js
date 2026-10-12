// Document Entity & Numerical Property Attribute Extractor
// Extracts and preserves exact dimensions, areas, and floor plans without loss or rounding.

class DocumentExtractor {
  extractPropertyRecord(rawText, metadata = {}) {
    const text = rawText || "";

    // 1. Exact Area Extractors
    const carpetAreaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)\s*(?:carpet|carpet\s*area)/i) ||
      text.match(/(?:carpet\s*area|carpet)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft)?/i);

    const builtUpAreaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)\s*(?:built.?up|super\s*built.?up)/i) ||
      text.match(/(?:built.?up\s*area|built.?up)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft)?/i);

    const plotAreaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)\s*plot/i) ||
      text.match(/(?:plot\s*area|plot\s*size|plot)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft)?/i);

    // 2. Plot Dimensions (e.g. 40x40, 30x50)
    const plotDimMatch = text.match(/(\d{2,3}\s*['xX*]\s*\d{2,3}(?:\s*['’])?)/);

    // 3. BHK & Configuration
    const bhkMatch = text.match(/(\d)\s*-?\s*BHK/i);
    const floorsMatch = text.match(/(?:G\s*\+\s*1|G\s*\+\s*2|Duplex|Triplex|Ground\s*Floor|Single\s*Storey)/i);

    // 4. Amenities & Specific Highlights
    const hasGym = /gym|fitness/i.test(text);
    const hasYoga = /yoga|meditation/i.test(text);
    const hasPool = /swimming\s*pool|pool/i.test(text);
    const hasGazebo = /gazebo/i.test(text);
    const hasPergola = /pergola/i.test(text);
    const hasParking = /car\s*parking|garage|covered\s*parking/i.test(text);
    const hasTerrace = /terrace|rooftop/i.test(text);

    return {
      modelName: metadata.title || metadata.modelName || "Bungalow Plan",
      propertyType: /bungalow|villa/i.test(text) ? "Bungalow" : /duplex/i.test(text) ? "Duplex" : "Flat",
      bhk: bhkMatch ? parseInt(bhkMatch[1], 10) : 3,
      carpetArea: carpetAreaMatch ? parseFloat(carpetAreaMatch[1]) : null,
      builtUpArea: builtUpAreaMatch ? parseFloat(builtUpAreaMatch[1]) : null,
      plotArea: plotAreaMatch ? parseFloat(plotAreaMatch[1]) : null,
      plotDimensions: plotDimMatch ? plotDimMatch[1].trim() : null,
      floors: floorsMatch ? floorsMatch[0] : "G+1",
      amenities: {
        gym: hasGym,
        yoga: hasYoga,
        swimmingPool: hasPool,
        gazebo: hasGazebo,
        pergola: hasPergola,
        parking: hasParking,
        terrace: hasTerrace,
      },
      rawExcerpt: text.slice(0, 500),
      extractedAt: new Date().toISOString(),
    };
  }
}

module.exports = new DocumentExtractor();
