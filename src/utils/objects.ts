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

export const deepClone = <T>(obj: T): T => {
	return JSON.parse(JSON.stringify(obj));
};

export type casedObjectConfigurationType = {
	case?: 'snake' | 'camel' | 'upper' | 'lower'; // The type of casing to apply
	delimiter?: string; // The delimiter to use for separating words in the keys
};

export type casedObjectType<T> = casedObjectConfigurationType & {
	obj?: Record<string, any>; // The data object to be transformed
};

export const caseObjectKeys = <T>({ obj = {}, case: casting_case = 'snake', delimiter = '_' }: casedObjectType<T>) => {
	// const result = {};
	const valid_cases = ['snake', 'camel', 'upper', 'lower'];
	if (!valid_cases.includes(casting_case)) {
		throw new Error(`Invalid casting type: ${casting_case}. Valid types are ${valid_cases.join(', ')}.`);
	}

	for (let key in obj) {
		if (Object.hasOwn(obj, key)) {
			let newKey = String(key).replaceAll(' ', delimiter);
			if (casting_case === 'snake' || casting_case === 'lower') {
				newKey = newKey.toLowerCase();
			} else if (casting_case === 'upper') {
				newKey = newKey.toUpperCase();
			} else if (casting_case === 'camel') {
				newKey = newKey
					.split(delimiter)
					.map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
					.join('');
			}
			obj[newKey] = obj[key];
			if (newKey !== key) {
				delete obj[key];
			}
		}
	}
	return obj;
};

export default {
	filterObject,
	difference,
	deepClone,
	caseObjectKeys,
};
