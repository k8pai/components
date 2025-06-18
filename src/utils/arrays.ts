import { fuzzySubsequenceMatch } from './strings';

type SortKey<T> = {
	key: keyof T;
	desc?: boolean;
};

const multiSort = <T>(arr: T[], keys: SortKey<T>[]): T[] => {
	return [...arr].sort((a, b) => {
		for (const { key, desc = false } of keys) {
			const dir = desc ? -1 : 1;
			if (a[key]! < b[key]!) return -1 * dir;
			if (a[key]! > b[key]!) return 1 * dir;
		}
		return 0;
	});
};

const groupBy = <T>(array: T[], key: keyof T | ((item: T) => string | number)): Record<string | number, T[]> => {
	return array.reduce(
		(acc, item) => {
			const groupKey = typeof key === 'function' ? key(item) : (item[key] as string | number);
			(acc[groupKey] ||= []).push(item);
			return acc;
		},
		{} as Record<string | number, T[]>
	);
};

const filterWithQuery = <T>(arr: T[], query: string, keys: (keyof T)[]): T[] => {
	const lower = query.toLowerCase();
	return arr.filter((item) => keys.some((key) => typeof item[key] === 'string' && (item[key] as string).toLowerCase().includes(lower)));
};

const uniqueBy = <T, K>(arr: T[], keyFn: (item: T) => K): T[] => {
	const seen = new Set<K>();
	return arr.filter((item) => {
		const key = keyFn(item);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
};

const partition = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
	return arr.reduce<[T[], T[]]>(
		(acc, item) => {
			(predicate(item) ? acc[0] : acc[1]).push(item);
			return acc;
		},
		[[], []]
	);
};

const fuzzyFilter = <T>(list: T[], query: string, toStringFn: (item: T) => string = (item) => String(item)): T[] =>
	!query ? list : list.filter((item) => fuzzySubsequenceMatch(toStringFn(item), query));

export { filterWithQuery, fuzzyFilter, groupBy, multiSort, partition, uniqueBy };
