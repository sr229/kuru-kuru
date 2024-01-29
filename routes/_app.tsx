import { AppProps } from "$fresh/server.ts";
import Footer from "../components/Footer.tsx";
import { Partytown } from "partytown";

export default function App({ Component }: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <meta property="og:title" content="Kuru Kuru~" />
        <meta property="og:site_name" content="Kuru Kuru~" />
        <meta property="og:url" content="https://herta.deno.dev" />
        <meta
          property="og:description"
          content="The website for Herta, the cutest genius Honkai: Star Rail character out there."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://herta.deno.dev/assets/img/hertaa1.gif"
        />
        <meta name="title" content="Herta Kuru" />
        <meta
          name="description"
          content="The website for Herta, the cutest genius Honkai: Star Rail character out there."
        />
        <meta
          name="keywords"
          content="Kuru2, Kuru Kuru, Kuru Kuru herta, kuru kuru herta hsr, kuru kuru herta star rail, herta honkai star rail, herta, herta hsr, star rail herta"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="canonical" content="https://herta.deno.dev/" />
        <script
          src="https://takeback.bysourfruit.com/api/kit/1QFWK02N8XLPML2AHW8TVD"
          type="text/partytown"
        />
        <title>Kuru kuru~!</title>
      </head>
      <body>
        <Partytown />
        <Component />
      </body>
      <Footer />
    </html>
  );
}
