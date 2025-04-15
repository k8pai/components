export type FilterObjectPredicate<T> = (key: keyof T, value: T[keyof T]) => boolean;

export const filterObject = <T extends Object>(obj: T, predicate: FilterObjectPredicate<T>) => {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(key as keyof T, value))) as Partial<T>;
};

export default {
	filterObject,
};
