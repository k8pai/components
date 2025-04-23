import { useEffect, useRef } from 'react';

type Watchable = Record<string, any>;

function deepEqual(a: any, b: any): boolean {
	try {
		return JSON.stringify(a) === JSON.stringify(b);
	} catch {
		return false; // circular fallback
	}
}

function deepClone<T>(val: T): T {
	try {
		return JSON.parse(JSON.stringify(val));
	} catch {
		return val;
	}
}

export const useLogger = (vars: Watchable) => {
	const prevRef = useRef<Record<string, any>>({});

	useEffect(() => {
		Object.entries(vars).forEach(([key, value]) => {
			const prev = prevRef.current[key];

			if (!deepEqual(prev, value)) {
				if (key in prevRef.current) {
					console.log(`[Logger] "${key}" changed:`, prev, '→', value);
				} else {
					console.log(`[Logger] "${key}" initialized:`, value);
				}

				prevRef.current[key] = deepClone(value);
			}
		});
	});
};
