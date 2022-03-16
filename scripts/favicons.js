const fs = require("fs");

const source = "public/icon.svg", output = "public/";

const configuration = {
  path: "/",
  appName: "Yoga Sof",
  appShortName: "Yoga Sof",
  appDescription: "Pratique du Yoga à Hésingue",
  developerName: "Florian Cassayre",
  developerURL: "https://florian.cassayre.me",
  dir: "auto",
  lang: "fr-FR",
  background: "#fff",
  theme_color: "#fff",
  appleStatusBarStyle: "black-translucent",
  display: "standalone",
  orientation: "any",
  scope: "/",
  start_url: "/",
  preferRelatedApplications: false,
  relatedApplications: undefined,
  version: "1.0",
  logging: false,
  pixel_art: false,
  loadManifestWithCredentials: false,
  manifestMaskable: false,
  icons: {
    // https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
    android: [
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
    ],
    appleIcon: ["apple-touch-icon.png"],
    appleStartup: false,
    favicons: ["favicon.ico"],
    windows: false,
    yandex: false,
  },
};

const callback = (error, response) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
    return;
  }
  [response.images, response.files].forEach(files => files.forEach(({ name, contents }) => {
    fs.writeFileSync(output + name, contents);
  }));
  console.log(response.html.join("\n"));
};

import('favicons').then(({ favicons }) =>
  favicons(source, configuration, callback)
);
