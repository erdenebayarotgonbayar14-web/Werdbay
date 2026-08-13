/* ==========================================================================
   ALBUM DATA — this is the only file you need to edit to add a new album.

   Copy one { ... } block, paste it below the last one, change the values.
   Put the image files in:  photos/<slug>/
   ========================================================================== */

const SITE = {
  name: "Erdenebayar",
  role: "Photography",
  place: "Ulaanbaatar, Mongolia",
  email: "hello@yourdomain.com",
  instagram: "@yourhandle",
  instagramUrl: "https://instagram.com/yourhandle",
  intro: "Portraits and long-form documentary work, mostly outside the city."
};

const ALBUMS = [
  {
    slug: "khangai-winter",          // folder name + web address. lowercase, no spaces
    title: "Khangai, Winter",        // shown under the cover photo
    year: "2025",
    place: "Arkhangai",
    cover: "photos/khangai-winter/cover.jpg",
    description:
      "Ten days with two families moving between winter camps. I photographed early, " +
      "before the light hardened, and stayed close to the daily work rather than the landscape.",
    photos: [
      { src: "photos/khangai-winter/01.jpg", caption: "First morning. The stove is lit before anyone speaks." },
      { src: "photos/khangai-winter/02.jpg", caption: "Bataa checks the herd on the ridge above camp." },
      { src: "photos/khangai-winter/03.jpg", caption: "" },
      { src: "photos/khangai-winter/04.jpg", caption: "Snow came in the afternoon and stayed four days." }
    ]
  },

  {
    slug: "city-nights",
    title: "City Nights",
    year: "2024",
    place: "Ulaanbaatar",
    cover: "photos/city-nights/cover.jpg",
    description:
      "A year of walking the same three districts after dark, shot on film.",
    photos: [
      { src: "photos/city-nights/01.jpg", caption: "Sukhbaatar Square, 11pm." },
      { src: "photos/city-nights/02.jpg", caption: "Waiting for the last bus." },
      { src: "photos/city-nights/03.jpg", caption: "" }
    ]
  },

  {
    slug: "portraits",
    title: "Portraits",
    year: "2023—2025",
    place: "Various",
    cover: "photos/portraits/cover.jpg",
    description:
      "Commissioned and personal portrait work. Available for editorial and studio bookings.",
    photos: [
      { src: "photos/portraits/01.jpg", caption: "Studio, natural light only." },
      { src: "photos/portraits/02.jpg", caption: "" }
    ]
  }
];
