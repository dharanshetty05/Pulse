export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length === 0) return [];
  
  const parseLine = (line: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i+1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    records.push(record);
  }

  return records;
}
