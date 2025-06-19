export interface CsvToJsonOptions {
	csv: string;
	delimiter?: string;
}

export type JsonObject = { [key: string]: string };

// Custom CSV-to-JSON converter function
export const csvToJson = ({ csv, delimiter = ',' }: CsvToJsonOptions): JsonObject[] => {
	const rows: string[][] = [];
	let inQuotes: boolean = false;
	let field: string = '';
	let row: string[] = [];
	let quoteChar: string | null = null;

	const pushField = (): void => {
		row.push(field.trim());
		field = '';
	};

	for (let i = 0; i < csv.length; i++) {
		const char: string = csv[i];
		const nextChar: string = csv[i + 1];

		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true;
			quoteChar = char;
		} else if (char === quoteChar && inQuotes) {
			if (nextChar === quoteChar) {
				field += quoteChar;
				i++;
			} else {
				inQuotes = false;
				quoteChar = null;
			}
		} else if (char === delimiter && !inQuotes) {
			pushField();
		} else if ((char === '\n' || char === '\r') && !inQuotes) {
			if (field || row.length > 0) pushField();
			if (row.length > 0) rows.push(row);
			row = [];
			if (char === '\r' && nextChar === '\n') i++;
		} else {
			field += char;
		}
	}

	if (field || row.length > 0) {
		pushField();
		if (row.length > 0) rows.push(row);
	}

	const [header, ...lines] = rows;
	return lines.map(
		(line): JsonObject =>
			header.reduce((obj: JsonObject, key: string, i: number) => {
				obj[key] = line[i] ?? '';
				return obj;
			}, {})
	);
};
