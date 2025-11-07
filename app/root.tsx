import type { MetaFunction, LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "Bota pra Rodar" },
    { viewport: "width=device-width,initial-scale=1" }
  ];
};

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {/* <LiveReload /> */}
      </body>
    </html>
  );
}
