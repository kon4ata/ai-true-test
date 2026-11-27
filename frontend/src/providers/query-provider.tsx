"use client";

import { createQueryClient } from "@/shared/queryClient.ts";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface IQueryProviderProps {
	children: ReactNode;
}

export default function QueryProvider({
	children,
}: IQueryProviderProps) {
	const [queryClient] = useState(createQueryClient);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
