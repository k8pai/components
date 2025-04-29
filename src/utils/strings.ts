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

export default {
	fuzzySubsequenceMatch,
};
