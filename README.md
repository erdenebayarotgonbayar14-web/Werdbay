# Portfolio site

Four files, no build step, no server code. Works on any static host
(GitHub Pages, Netlify, Cloudflare Pages, or ordinary shared hosting).

```
index.html        home page — the album grid
album.html        one album — photos with captions beside them
data.js           ← the only file you edit
style.css         all styling
photos/           your images
```

## First setup

1. Open `data.js` and edit the `SITE` block: name, email, Instagram, intro line.
2. Create a folder per album inside `photos/`, for example `photos/khangai-winter/`.
3. Put a `cover.jpg` and your numbered photos in it.
4. Upload everything to your domain's web root.

Until real photos exist, each image slot shows a grey box with the exact file
path it is looking for — useful for checking your folder names.

## Adding a new album

In `data.js`, copy one `{ ... }` block and change these values:

```js
{
  slug: "new-album",                     // folder name + web address
  title: "New Album",                    // shown under the cover photo
  year: "2026",
  place: "Khentii",
  cover: "photos/new-album/cover.jpg",
  description: "The main description shown at the top of the album page.",
  photos: [
    { src: "photos/new-album/01.jpg", caption: "Caption shown beside this photo." },
    { src: "photos/new-album/02.jpg", caption: "" }   // empty = no caption
  ]
}
```

That is the whole job — the grid, the photo count, the frame numbers and the
album page all update themselves. Albums appear in the order they are listed,
so put the newest one first.

## Image sizes

Export covers around 1600px on the long edge and full photos around 2400px,
JPEG quality 80. Anything larger just slows the page down.

## Nicer web addresses (optional)

Albums live at `yourdomain.com/album.html?a=new-album`. If you would rather
have `yourdomain.com/albums/new-album/`, make a folder per album containing a
copy of `album.html` and hard-code the slug instead of reading it from the URL.
More upkeep, prettier links.
