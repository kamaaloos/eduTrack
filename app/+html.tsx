import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Custom web document shell for Expo Router.
 * @see https://docs.expo.dev/router/reference/static-rendering/#root-html
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#FFFFFF" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                width: 100%;
                min-height: 100%;
                height: 100%;
              }
              body {
                margin: 0;
                background-color: #E8F2FA;
                overflow: auto;
              }
              #root {
                display: flex;
                flex: 1;
                align-self: stretch;
              }
              input, textarea {
                outline-color: #2563EB;
              }
              .dashboard-hide-scrollbar::-webkit-scrollbar {
                display: none;
                width: 0;
                height: 0;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
