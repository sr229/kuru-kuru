import { AppProps } from "$fresh/server.ts";
import Footer from "../components/Footer.tsx";

export default function App({ Component }: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Kuru Kuru~" />
        <meta property="og:site_name" content="Kuru Kuru~" />
        <meta property="og:url" content="https://herta.sr229.cf" />
        <meta
          property="og:description"
          content="The website for Herta, the cutest genius Honkai: Star Rail character out there."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://herta.sr229.cf/assets/img/hertaa1.gif"
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
        <meta name="canonical" content="https://herta.sr229.cf/" />
        <script src="https://takeback.bysourfruit.com/api/kit/7NHKHAQY12LGE1WUP9Z806" />
        <title>Kuru kuru~!</title>
      </head>
      <body>
        <Component />
      </body>
      <Footer />
    </html>
  );
}
