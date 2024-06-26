"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

interface Props {
    children: React.ReactNode;
}

export function Provider({ children }: Props) {
    return (
        <NextUIProvider style={{ minHeight: "85%" }}>
            <QueryClientProvider client={queryClient}>
                <main className="dark:text-neutral-400 text-neutral-700 flex flex-col items-center justify-between md:p-5 p-3 w-6xl max-w-full mt-2 md:mt-10">
                    {children}
                </main>
            </QueryClientProvider>
        </NextUIProvider>
    );
}