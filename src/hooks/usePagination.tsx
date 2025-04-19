import { useEffect, useMemo, useState } from 'react';

type UsePaginationProps<T> = {
	data: T[];
	numberOfRecords: number;
	initialPage?: number;
	onPageChange?: (page: number) => void;
	resetOnDataChange?: boolean;
};

type UsePaginationReturn<T> = {
	currentPage: number;
	totalPages: number;
	paginatedData: T[];
	setPage: (page: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	canNext: boolean;
	canPrev: boolean;
	pageSize: number;
	setPageSize: (size: number) => void;
	range: number[];
};

export const usePagination = <T,>({
	data,
	numberOfRecords,
	initialPage = 1,
	onPageChange,
	resetOnDataChange = true,
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(numberOfRecords);

	const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return data.slice(start, start + pageSize);
	}, [data, currentPage, pageSize]);

	const setPage = (page: number) => {
		const clamped = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(clamped);
		onPageChange?.(clamped);
	};

	const nextPage = () => setPage(currentPage + 1);
	const prevPage = () => setPage(currentPage - 1);

	useEffect(() => {
		if (resetOnDataChange) {
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	const range = useMemo(() => {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}, [totalPages]);

	return {
		currentPage,
		totalPages,
		paginatedData,
		setPage,
		nextPage,
		prevPage,
		canNext: currentPage < totalPages,
		canPrev: currentPage > 1,
		pageSize,
		setPageSize,
		range,
	};
};
