import React from "react";
import type { AppProps } from "next/app";

import "../src/ui/styles/globals.css";

// used to disabled SSR
function SafeHydrate({ children }: any) {
  return <div suppressHydrationWarning>{typeof window === "undefined" ? null : children}</div>;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <SafeHydrate>
    <Component {...pageProps} />
    // </SafeHydrate>
  );
}

export default MyApp;
