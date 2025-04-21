// useBoolean.ts
import { useState } from 'react';

/**
 * A custom hook that manages a boolean state.
 * @param initial - The initial state of the boolean (default is false).
 * @returns An object containing the current value and functions to set it.
 */
export type UseBoolean = {
	value: boolean;
	on: () => void;
	off: () => void;
	toggle: () => void;
};

export const useBoolean = (initial = false) => {
	const [value, setValue] = useState<boolean>(initial);
	const on = () => setValue(true);
	const off = () => setValue(false);
	const toggle = () => setValue((v) => !v);
	return { value, on, off, toggle };
};
