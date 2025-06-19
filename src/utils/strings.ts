export const fuzzySubsequenceMatch = (text: string, query: string): boolean => {
	let i = 0;
	for (const char of text) {
		if (char.toLowerCase() === query[i]?.toLowerCase()) {
			i++;
			if (i === query.length) return true;
		}
	}
	return false;
};

export const toSnakeCase = (str: string, delimiter: string = '_'): string => {
	return String(str).replaceAll(' ', delimiter).toLowerCase();
};

export const toCamelCase = (str: string, delimiter: string = '_'): string => {
	let newKey = String(str).replaceAll(' ', delimiter);
	return newKey
		.split(delimiter)
		.map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
		.join('');
};
