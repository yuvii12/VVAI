/* Original backend file: backend/services/documents/documentStore.js  (unchanged, registered for the browser) */
VVServer.define("services/documents/documentStore.js", function (require, module, exports, __dirname) {

// Document Storage, Chunking & Retrieval Index
// Associates every chunk with document_id, version_id, state, city, project, phase, property, property_type.

const { v4: uuidv4 } = require("uuid");
const documentParser = require("./documentParser");
const documentExtractor = require("./documentExtractor");

class DocumentStore {
  constructor() {
    this.documents = [
      {
        id: "doc_1",
        versionId: "v1.0",
        title: "Building Specification - Deluxe vs Luxury",
        fileName: "Building_Specification.pdf",
        fileType: "pdf",
        fileSize: 1024500,
        category: "Specifications",
        uploadedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        id: "doc_2",
        versionId: "v2.1",
        title: "Office & Site Address Bihar/Jharkhand/WB/UP/Odisha",
        fileName: "Office_Site_Address_Aug2026.pdf",
        fileType: "pdf",
        fileSize: 2048100,
        category: "Locations",
        uploadedAt: "2026-09-05T12:00:00.000Z",
      },
      {
        id: "doc_3",
        versionId: "v1.5",
        title: "Bungalow Property Summary - Yamuna, Business, Ananta, Jayanti, CEO",
        fileName: "Bungalow_Property_Summary.pdf",
        fileType: "pdf",
        fileSize: 3145728,
        category: "Bungalows",
        uploadedAt: "2026-09-06T14:30:00.000Z",
      },
    ];

    this.chunks = [];
    this.initDefaultChunks();
  }

  initDefaultChunks() {
    // PDF 3: Exact Bungalow Numerical Attributes
    this.addChunk({
      documentId: "doc_3",
      versionId: "v1.5",
      property: "Yamuna Standard Plan",
      propertyType: "Bungalow",
      bhk: 5,
      carpetArea: 1680,
      builtUpArea: 2250,
      plotArea: 1600,
      plotDimensions: "40x40",
      floors: "G+1",
      amenities: ["Covered Parking", "Pergola", "Gazebo", "Large Balcony", "Granite Kitchen"],
      content: "Yamuna Standard Plan: 5 BHK Premium Bungalow. Plot Area: 1600 sq.ft (40'x40'). Carpet Area: 1680 sq.ft. Built-up Area: 2250 sq.ft. Structure: G+1 R.C.C. Frame. Includes decorative entrance, covered parking, rooftop terrace, pergola, and gazebo garden area.",
    });

    this.addChunk({
      documentId: "doc_3",
      versionId: "v1.5",
      property: "Business Bungalow",
      propertyType: "Bungalow",
      bhk: 2,
      carpetArea: 1100,
      builtUpArea: 1450,
      plotArea: 1200,
      plotDimensions: "30x40",
      floors: "G+1",
      amenities: ["Commercial Ground Shutter/Office", "Residential 1st Floor", "Parking"],
      content: "Business Bungalow: 2 BHK Commercial + Residential Hybrid. Plot Area: 1200 sq.ft (30'x40'). Carpet Area: 1100 sq.ft. Built-up Area: 1450 sq.ft. Designed with ground-floor commercial frontage and upper-floor living quarters.",
    });

    this.addChunk({
      documentId: "doc_3",
      versionId: "v1.5",
      property: "Ananta Bungalow",
      propertyType: "Bungalow",
      bhk: 3,
      carpetArea: 1350,
      builtUpArea: 1800,
      plotArea: 1400,
      plotDimensions: "35x40",
      floors: "G+1",
      amenities: ["Private Lawn", "Car Parking", "Spacious Modular Kitchen"],
      content: "Ananta Bungalow: 3 BHK Contemporary Villa. Plot Area: 1400 sq.ft (35'x40'). Carpet Area: 1350 sq.ft. Built-up Area: 1800 sq.ft. G+1 structure featuring private lawn, car parking, modern modular kitchen, and three ensuite bedrooms.",
    });

    this.addChunk({
      documentId: "doc_3",
      versionId: "v1.5",
      property: "Jayanti Standard Bungalow",
      propertyType: "Bungalow",
      bhk: 3,
      carpetArea: 1200,
      builtUpArea: 1600,
      plotArea: 1200,
      plotDimensions: "30x40",
      floors: "G+1",
      amenities: ["Standard Parking", "Front Verandah", "Balcony"],
      content: "Jayanti Standard Bungalow: 3 BHK Elegant Family Bungalow. Plot Area: 1200 sq.ft (30'x40'). Carpet Area: 1200 sq.ft. Built-up Area: 1600 sq.ft. Efficient G+1 duplex plan with front verandah, car porch, and spacious drawing-dining area.",
    });

    this.addChunk({
      documentId: "doc_3",
      versionId: "v1.5",
      property: "CEO Bungalow",
      propertyType: "Bungalow",
      bhk: 5,
      carpetArea: 2550,
      builtUpArea: 3400,
      plotArea: 2400,
      plotDimensions: "40x60",
      floors: "G+2",
      amenities: ["Private Swimming Pool", "Gym Room", "Yoga Deck", "Pergola Rooftop", "Double Car Garage"],
      content: "CEO Bungalow: 5 BHK Ultra Luxury Executive Estate. Plot Area: 2400 sq.ft (40'x60'). Carpet Area: 2550 sq.ft. Built-up Area: 3400 sq.ft. G+2 architectural masterpiece featuring private splash pool, gym/fitness room, open yoga deck, double car garage, and premium Italian marble finishes.",
    });
  }

  addChunk(chunk) {
    const id = `chk_${uuidv4().slice(0, 8)}`;
    this.chunks.push({
      id,
      state: chunk.state || null,
      city: chunk.city || null,
      project: chunk.project || null,
      phase: chunk.phase || null,
      property: chunk.property || null,
      propertyType: chunk.propertyType || null,
      ...chunk,
    });
  }

  getDocuments(q = null) {
    if (!q) return this.documents;
    const term = q.toLowerCase();
    return this.documents.filter(
      (d) => d.title.toLowerCase().includes(term) || d.category.toLowerCase().includes(term)
    );
  }

  searchChunks({ q, city, property, propertyType }) {
    let results = [...this.chunks];

    if (city) {
      const cityLower = city.toLowerCase();
      results = results.filter((c) => !c.city || c.city.toLowerCase() === cityLower);
    }
    if (property) {
      const pLower = property.toLowerCase();
      results = results.filter((c) => c.property && c.property.toLowerCase().includes(pLower));
    }
    if (propertyType) {
      const ptLower = propertyType.toLowerCase();
      results = results.filter((c) => c.propertyType && c.propertyType.toLowerCase().includes(ptLower));
    }
    if (q) {
      const term = q.toLowerCase();
      results = results.filter((c) => c.content.toLowerCase().includes(term));
    }

    return results;
  }
}

module.exports = new DocumentStore();

});
