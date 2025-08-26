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

function diffArrays(refArr: any[], currArr: any[]): any[] {
	return currArr.map((currItem, index) => {
		const refItem = refArr?.[index];
		const diff: Record<string, any> = {};

		for (const key in currItem) {
			if (JSON.stringify(currItem[key]) !== JSON.stringify(refItem?.[key])) {
				diff[key] = currItem[key];
			}
		}

		for (const key in refItem) {
			if (!(key in currItem)) {
				diff[key] = undefined;
			}
		}

		return Object.keys(diff).length ? diff : {};
	});
}

export const useLogger = (vars: Watchable) => {
	const prevRef = useRef<Record<string, any>>({});

	useEffect(() => {
		Object.entries(vars).forEach(([key, value]) => {
			const prev = prevRef.current[key];

			if (!deepEqual(prev, value)) {
				if (key in prevRef.current) {
					if (Array.isArray(prev) && Array.isArray(value)) {
						const diffs = diffArrays(prev, value);
						const changedRows = diffs
							.map((diff, idx) => (Object.keys(diff).length ? `→ index ${idx}: ${JSON.stringify(diff)}` : null))
							.filter(Boolean);

						if (changedRows.length > 0) {
							console.group(`[Logger] "${key}" changed:`);
							changedRows.forEach((change) => console.log(change));
							console.groupEnd();
						}
					} else {
						console.log(`[Logger] "${key}" changed:`, prev, '→', value);
					}
				} else {
					console.log(`[Logger] "${key}" initialized:`, value);
				}

				prevRef.current[key] = deepClone(value);
			}
		});
	});
};
