import { AppProps } from "$fresh/server.ts";
import Footer from "../islands/Footer.tsx";

export default function App({ Component }: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src='https://takeback.bysourfruit.com/api/kit/7NHKHAQY12LGE1WUP9Z806' />
        <title>Kuru kuru~!</title>
      </head>
      <body>
        <Component />
      </body>
      <Footer />
    </html>
  );
}
