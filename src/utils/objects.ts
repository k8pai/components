export type FilterObjectPredicate<T> = (key: keyof T, value: T[keyof T]) => boolean;

export const filterObject = <T extends Object>(obj: T, predicate: FilterObjectPredicate<T>) => {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(key as keyof T, value))) as Partial<T>;
};

export type differenceOptions<T> = {
	ignoreKeys?: (keyof T | string)[];
	union?: 'ALL' | 'DISTINCT' | 'NONE';
	preferFrom?: 'LEFT' | 'RIGHT';
	ignoreUndefined?: boolean;
};

export const difference = <T extends Record<string, any>>(
	a: Partial<T>,
	b: Partial<T>,
	options: differenceOptions<T> = { preferFrom: 'RIGHT' }
): Partial<T> => {
	const { ignoreKeys = [], union = 'DISTINCT', preferFrom = 'RIGHT', ignoreUndefined = true } = options;

	const keys = new Set<string>();

	// Determine the keys to compare based on the union option
	if (union === 'ALL') {
		Object.keys(a).forEach((k) => keys.add(k));
		Object.keys(b).forEach((k) => keys.add(k));
	} else if (union === 'DISTINCT') {
		const aKeys = new Set(Object.keys(a));
		const bKeys = new Set(Object.keys(b));
		for (const k of new Set([...aKeys, ...bKeys])) {
			if (!(aKeys.has(k) && bKeys.has(k))) {
				keys.add(k);
			}
		}
	} else {
		Object.keys(a).forEach((k) => keys.add(k));
	}

	// Filter out the keys that are in the ignoreKeys array
	const diff: Partial<T> = {};

	for (const key of keys) {
		// Check if the key is in the ignoreKeys array
		if (ignoreKeys.includes(key as keyof T)) continue;

		const aVal = a[key];
		const bVal = b[key];

		const different = aVal !== bVal;
		if (!different) continue;

		const value = preferFrom === 'LEFT' ? aVal : bVal;

		if (ignoreUndefined && value === undefined) continue;

		diff[key as keyof T] = value;
	}

	return diff;
};

export default {
	filterObject,
};
