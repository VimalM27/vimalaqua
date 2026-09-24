// =====================================================================
//  VIMAL ART STUDIO — YOUR ARTWORKS (mandala, lippan, paintings...)
//  To add an artwork: copy one block { ... }, paste it in the list
//  (put a comma between blocks), change the details, and put the
//  photos in  images/art/
//
//  category : "mandala" | "lippan" | "painting" | "other"
//  images   : list of photos. People SWIPE (or tap the arrows) to see them.
//             The first photo is the main one shown on the card.
//  price    : number in rupees (e.g. 1500).  Use 0 for "price on request".
//  status   : "available" | "sold"
//  Keep every id unique (no spaces).
// =====================================================================

window.ART_WHATSAPP = "917845452727";   // your WhatsApp number (country code, no +)

window.ART_WORKS = [
  {
    id: "jagannath-mandala",
    title: "Jagannath Mandala",
    category: "mandala",
    medium: "Markers" & colour and glitter on paper",   // <- change to your real medium
    size: "A3",                        // <- change to your real size
    price: 5000,                          // <- put your price, e.g. 3500 (0 = price on request)
    status: "available",
    images: [
      "images/art/jagannath-mandala-1.jpg"
      "images/art/jagannath-mandala-2.jpg"
      "images/art/jagannath-mandala-3.jpg"
    ],
    description: "Hand-drawn Lord Jagannath mandala in red, black and white with fine detailed patterns and red glitter accents."
  }
];
