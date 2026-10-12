// Documents Management & Ingestion Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const documentStore = require("../services/documents/documentStore");
const documentParser = require("../services/documents/documentParser");
const documentExtractor = require("../services/documents/documentExtractor");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/documents
router.get("/", (req, res) => {
  const { q } = req.query;
  const docs = store.getDocuments(q);
  res.json({ count: docs.length, documents: docs });
});

// POST /api/documents/upload (Admin upload)
router.post("/upload", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { title, fileName, fileType, fileSize, category } = req.body || {};
  if (!title || !fileName) {
    return res.status(400).json({ error: "Document title and fileName are required." });
  }

  const doc = store.addDocument(
    {
      title,
      fileName,
      fileType: fileType || "pdf",
      fileSize: fileSize || 1048576,
      category: category || "General",
    },
    req.user
  );

  res.status(201).json({ message: "Document recorded.", document: doc });
});

// POST /api/documents/ingest (Admin/Staff document chunk ingestion)
router.post("/ingest", requireAuth, (req, res) => {
  const {
    documentId,
    versionId,
    title,
    content,
    state,
    city,
    project,
    phase,
    property,
    propertyType,
    bhk,
    carpetArea,
    builtUpArea,
    plotArea,
    plotDimensions,
    amenities,
  } = req.body || {};

  if (!content && !property) {
    return res.status(400).json({ error: "Document content or property name is required for ingestion." });
  }

  // Extract dimensions automatically from content if not explicitly provided
  const extracted = content ? documentExtractor.extractPropertyRecord(content, { title, property }) : null;

  const chunkPayload = {
    documentId: documentId || `doc_${Date.now()}`,
    versionId: versionId || "v1.0",
    title: title || property || "Document Specification",
    state: state || null,
    city: city || null,
    project: project || null,
    phase: phase || null,
    property: property || (extracted ? extracted.modelName : "Bungalow Plan"),
    propertyType: propertyType || (extracted ? extracted.propertyType : "Bungalow"),
    bhk: bhk || (extracted ? extracted.bhk : null),
    carpetArea: carpetArea || (extracted ? extracted.carpetArea : null),
    builtUpArea: builtUpArea || (extracted ? extracted.builtUpArea : null),
    plotArea: plotArea || (extracted ? extracted.plotArea : null),
    plotDimensions: plotDimensions || (extracted ? extracted.plotDimensions : null),
    amenities: amenities || (extracted && extracted.amenities ? Object.keys(extracted.amenities).filter(k => extracted.amenities[k]) : []),
    content: content || `${property}: Carpet area ${carpetArea || "N/A"} sq.ft, Built-up area ${builtUpArea || "N/A"} sq.ft`,
  };

  documentStore.addChunk(chunkPayload);

  res.status(201).json({
    message: "Document chunk successfully ingested with preserved numerical attributes.",
    chunk: chunkPayload,
    extracted,
  });
});

// POST /api/documents/parse (Parse raw text or structured content for exact specs)
router.post("/parse", (req, res) => {
  const { text, title, format } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: "Text content is required for parsing." });
  }

  const extracted = documentExtractor.extractPropertyRecord(text, { title });
  res.json({
    status: "parsed",
    format: format || "text",
    extractedDimensions: extracted,
  });
});

// GET /api/documents/chunks (Search indexed chunks)
router.get("/chunks", (req, res) => {
  const { q, city, property, propertyType } = req.query;
  const chunks = documentStore.searchChunks({ q, city, property, propertyType });
  res.json({ count: chunks.length, chunks });
});

// GET /api/documents/dimensions (Query exact numerical property dimensions)
router.get("/dimensions", (req, res) => {
  const { property, city, propertyType } = req.query;
  const chunks = documentStore.searchChunks({ property, city, propertyType });
  const dimensions = chunks.map((c) => ({
    property: c.property,
    propertyType: c.propertyType,
    bhk: c.bhk,
    carpetArea: c.carpetArea,
    builtUpArea: c.builtUpArea,
    plotArea: c.plotArea,
    plotDimensions: c.plotDimensions,
    floors: c.floors,
    amenities: c.amenities,
    documentId: c.documentId,
    versionId: c.versionId,
  }));
  res.json({ count: dimensions.length, dimensions });
});

module.exports = router;

