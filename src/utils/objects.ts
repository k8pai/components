export type FilterObjectPredicate<T> = (key: keyof T, value: T[keyof T]) => boolean;

export const filterObject = <T extends Object>(obj: T, predicate: FilterObjectPredicate<T>) => {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(key as keyof T, value))) as Partial<T>;
};

export const difference = <T extends Object>(a: T, b: T): Partial<T> => {
	const diff: Partial<T> = {};
	for (const key in a) {
		if (a[key] !== b[key]) {
			diff[key] = b[key];
		}
	}
	return diff;
};

export default {
	filterObject,
};
