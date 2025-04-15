export const filterObject = <T extends object>(obj: T, predicate: (key: keyof T, value: T[keyof T]) => boolean): Partial<T> => {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(key as keyof T, value))) as Partial<T>;
};

export default {
	filterObject,
};
