// =====================================================================
//  VIMAL ART STUDIO — YOUR ARTWORKS (mandala, lippan, paintings...)
//  To add an artwork: copy one block { ... }, paste it in the list,
//  change the details, and put the photo in  images/art/
//
//  category : "mandala" | "lippan" | "painting" | "other"
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
    medium: "markers & colour and glitter on paper",   // <- change to your real medium
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
  {
    id: "sample-2",
    title: "Sunset Dot Mandala",
    category: "mandala",
    medium: "Acrylic dot art",
    size: "10 x 10 in",
    price: 1800,
    status: "available",
    image: "images/art/sample-mandala-2.svg",
    description: "SAMPLE - replace me. Dot mandala in warm sunset colours."
  },
  {
    id: "sample-3",
    title: "Lippan Mirror Art",
    category: "lippan",
    medium: "Clay, mirrors & acrylic on MDF",
    size: "12 in round",
    price: 3200,
    status: "available",
    image: "images/art/sample-lippan-1.svg",
    description: "SAMPLE - replace me. Traditional lippan (clay & mirror) wall art."
  },
  {
    id: "sample-4",
    title: "Floral Abstract Painting",
    category: "painting",
    medium: "Acrylic on canvas",
    size: "16 x 20 in",
    price: 4500,
    status: "sold",
    image: "images/art/sample-painting-1.svg",
    description: "SAMPLE - replace me. Example of a sold artwork."
  },
  {
    id: "sample-5",
    title: "Green Leaf Painting",
    category: "painting",
    medium: "Watercolour",
    size: "A3",
    price: 1500,
    status: "available",
    image: "images/art/sample-painting-2.svg",
    description: "SAMPLE - replace me. Calm nature-inspired painting."
  },
  {
    id: "sample-6",
    title: "Custom Name Plate Art",
    category: "other",
    medium: "Mixed media",
    size: "A4",
    price: 0,
    status: "available",
    image: "images/art/sample-other-1.svg",
    description: "SAMPLE - replace me. Price on request example."
  }
];
