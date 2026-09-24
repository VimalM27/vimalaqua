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
    id: "sample-1",
    title: "Blue & Gold Mandala",
    category: "mandala",
    medium: "Acrylic & gold pen on canvas",
    size: "12 x 12 in",
    price: 2500,
    status: "available",
    image: "images/art/sample-mandala-1.svg",
    description: "SAMPLE - replace me. Hand-drawn mandala with fine gold detailing."
  },
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
