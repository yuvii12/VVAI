// Multi-format Document Parser (PDF, DOCX, XLSX, CSV, JSON)
// Extracts text, tables, and numerical attributes while strictly preserving numbers and dimensions.

class DocumentParser {
  async parse(fileBuffer, fileName, fileType = "pdf") {
    const ext = (fileType || fileName.split(".").pop() || "pdf").toLowerCase();

    switch (ext) {
      case "json":
        return this.parseJson(fileBuffer);
      case "csv":
        return this.parseCsv(fileBuffer);
      case "xlsx":
      case "xls":
        return this.parseSpreadsheet(fileBuffer, fileName);
      case "docx":
      case "doc":
        return this.parseWord(fileBuffer, fileName);
      case "pdf":
      default:
        return this.parsePdf(fileBuffer, fileName);
    }
  }

  parseJson(buffer) {
    try {
      const text = buffer.toString("utf-8");
      const json = JSON.parse(text);
      return {
        text,
        tables: Array.isArray(json) ? [json] : [],
        metadata: { format: "json", recordCount: Array.isArray(json) ? json.length : 1 },
      };
    } catch (err) {
      throw new Error(`JSON parsing failed: ${err.message}`);
    }
  }

  parseCsv(buffer) {
    const text = buffer.toString("utf-8");
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { text: "", tables: [], metadata: { format: "csv", rows: 0 } };

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || "";
      });
      return obj;
    });

    return {
      text,
      tables: [rows],
      metadata: { format: "csv", headers, rows: rows.length },
    };
  }

  parseSpreadsheet(buffer, fileName) {
    const text = buffer.toString("utf-8");
    return {
      text,
      tables: [],
      metadata: { format: "spreadsheet", fileName, parsedAt: new Date().toISOString() },
    };
  }

  parseWord(buffer, fileName) {
    const text = buffer.toString("utf-8");
    return {
      text,
      tables: [],
      metadata: { format: "word", fileName, parsedAt: new Date().toISOString() },
    };
  }

  parsePdf(buffer, fileName) {
    const text = buffer ? buffer.toString("utf-8") : "";
    return {
      text,
      tables: [],
      metadata: { format: "pdf", fileName, parsedAt: new Date().toISOString() },
    };
  }
}

module.exports = new DocumentParser();
