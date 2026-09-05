"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  scriptProps,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      scriptProps={{
        async: true,
        ...scriptProps,
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
