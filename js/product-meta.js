/* Vimal Pets & Toys: product facts you control. One file, one source of truth.
   Edit ONLY this file to change stock, price, brand, search keywords or the date a product was added.
   Anything left empty is ignored and the value in products-data.js is used.

   price      : number in rupees, e.g. 1200            (overrides products-data.js)
   stock      : number of units. 0 = Out of Stock, 1 or more = In Stock. Leave null if you do not track it.
   availability: "in_stock" | "out_of_stock" | "contact"   (use when you do not track a number)
   brand      : text, searchable
   keywords   : ["puppy","family dog"]                   (searchable)
   createdAt  : "YYYY-MM-DD", the real date you added the product. Needed for "Newest first".
   Products that are not in products-data.js (for example the sample toys) show "Contact to Confirm". */
window.VPW_META = {

  /* ===== Dogs ===== */
  "golden-retriever": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Golden Retriever
  "labrador-retriever": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Labrador Retriever
  "pug": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Pug
  "german-shepherd": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // German Shepherd
  "rottweiler": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Rottweiler
  "beagle": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Beagle
  "doberman": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Doberman
  "pomeranian": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Pomeranian
  "poodle": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Poodle
  "great-dane": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Great Dane
  "siberian-husky": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Siberian Husky
  "saint-bernard": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Saint Bernard
  "shih-tzu": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Shih Tzu
  "rajapalayam": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Rajapalayam
  "dalmatian": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Dalmatian
  "kombai": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Kombai
  "kanni": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Kanni

  /* ===== Cats ===== */
  "persian-cat": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Persian Cat
  "siamese-cat": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Siamese Cat
  "maine-coon": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Maine Coon
  "ragdoll": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ragdoll
  "bengal-cat": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Bengal Cat
  "british-shorthair": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // British Shorthair
  "himalayan-cat": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Himalayan Cat
  "bombay-cat": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Bombay Cat

  /* ===== Birds ===== */
  "amazon-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Amazon Parrot
  "caique": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Caique
  "crimson-bellied-conure": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Crimson Bellied Conure
  "hahns-macaw": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Hahn's Macaw
  "eclectus-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Eclectus Parrot
  "senegal-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Senegal Parrot
  "finches": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Finches
  "jenday-conure": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Jenday Conure
  "derbyan-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Derbyan Parrot
  "king-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // King Parrot
  "nanday-conure": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Nanday Conure
  "cockatiel": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Cockatiel
  "african-grey-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // African Grey Parrot
  "rosella-parrot": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Rosella Parrot

  /* ===== Fish ===== */
  "koi-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Koi Fish
  "gold-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Gold Fish
  "angel-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Angel Fish
  "betta-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Betta Fish
  "guppy": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Guppy
  "sailfin-molly": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Sailfin Molly
  "silver-sailfin-molly": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Silver Sailfin Molly
  "platy": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Platy
  "swordtail": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Swordtail
  "discus-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Discus Fish
  "oscar-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Oscar Fish
  "flowerhorn": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Flowerhorn
  "silver-arowana": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Silver Arowana
  "neon-tetra": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Neon Tetra
  "corydoras-catfish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Corydoras Catfish
  "ram-cichlid": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ram Cichlid
  "black-molly": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Black Molly
  "clown-loach": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Clown Loach
  "green-severum": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Green Severum
  "gourami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Gourami
  "tiger-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Tiger Barb
  "cherry-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Cherry Barb
  "rosy-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Rosy Barb
  "gold-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Gold Barb
  "black-ruby-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Black Ruby Barb
  "odessa-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Odessa Barb
  "convict-cichlid": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Convict Cichlid
  "parrot-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Parrot Fish
  "archer-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Archer Fish
  "silver-dollar": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Silver Dollar
  "tin-foil-barb": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Tin Foil Barb
  "pearl-gourami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Pearl Gourami
  "hatchetfish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Hatchetfish
  "plecostomus": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Plecostomus
  "fancy-molly": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Fancy Molly
  "fancy-platy": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Fancy Platy
  "knife-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Knife Fish
  "freshwater-puffer": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Freshwater Puffer
  "african-cichlids": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // African Cichlids
  "malawi-cichlid": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Malawi Cichlid
  "cherry-shrimp": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Cherry Shrimp
  "ghost-and-amano-shrimp": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ghost and Amano Shrimp
  "common-gold-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Common Gold Fish
  "comet-gold-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Comet Gold Fish
  "oranda": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Oranda
  "ranchu": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ranchu
  "black-moor": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Black Moor
  "lionhead": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Lionhead
  "ryukin": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ryukin
  "corydoras": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Corydoras
  "sailfin-pleco": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Sailfin Pleco
  "bristlenose-pleco": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Bristlenose Pleco
  "glass-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Glass Fish
  "red-tail-and-rainbow-shark": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Red Tail and Rainbow Shark
  "dwarf-gourami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Dwarf Gourami
  "blue-opaline-gourami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Blue / Opaline Gourami
  "golden-gourami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Golden Gourami
  "honey-gowrami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Honey gowrami
  "kuhli-loach": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Kuhli loach
  "yoyo-loach": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Yoyo loach
  "silver-shark": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Silver shark
  "peacock-bass": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Peacock bass
  "red-tailed-cat-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Red tailed cat fish
  "arowana": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Arowana
  "red-bellied-pacu": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Red bellied pacu
  "snake-head": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Snake head
  "vampire-tetra-payara-fish": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Vampire tetra / payara fish
  "bichir": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Bichir
  "kissing-gourami": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Kissing Gourami
  "fancy-swordtail": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Fancy Swordtail

  /* ===== Small Pets ===== */
  "guinea-pig": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Guinea Pig
  "hamster": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Hamster
  "rabbit": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Rabbit
  "hedgehog": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Hedgehog
  "ferret": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ferret
  "chinchilla": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Chinchilla
  "fancy-mouse": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Fancy Mouse
  "gerbil": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Gerbil
  "ball-python": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Ball Python
  "corn-snake": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Corn Snake
  "garter-snake": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Garter Snake
  "mexican-king-snake": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Mexican King Snake

  /* ===== Aquariums ===== */
  "2-feet-aquarium-tank": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // 2 Feet Aquarium Tank
  "3-feet-aquarium-tank": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // 3 Feet Aquarium Tank
  "4-feet-aquarium-tank": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // 4 Feet Aquarium Tank
  "custom-aquarium": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Custom Aquarium
  "wall-mounted-aquarium": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Wall Mounted Aquarium
  "glass-fish-bowl": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Glass Fish Bowl
  "led-aquarium-tank": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // LED Aquarium Tank
  "luxury-aquarium-setup": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Luxury Aquarium Setup

  /* ===== Accessories ===== */
  "aquarium-filter": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Aquarium Filter
  "air-pump": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Air Pump
  "led-aquarium-light": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // LED Aquarium Light
  "premium-fish-food": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Premium Fish Food
  "color-gravel": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Color Gravel
  "water-heater": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Water Heater
  "fish-net": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Fish Net
  "thermometer": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Thermometer
  "water-conditioner": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Water Conditioner
  "decorative-ornaments": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Decorative Ornaments

  /* ===== Pet Foods ===== */
  "premium-dog-food": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Premium Dog Food
  "whisker-cat-food": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Whisker Cat Food
  "bird-seed-mix": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Bird Seed Mix
  "small-pet-crunch": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Small Pet Crunch
  "reptile-nutrition-blend": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Reptile Nutrition Blend

  /* ===== Toys ===== */
  "chew-bone-toy": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Chew Bone Toy
  "feather-wand": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Feather Wand
  "bird-swing-toy": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Bird Swing Toy
  "squeaky-ball": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Squeaky Ball
  "small-pet-tunnel": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Small Pet Tunnel
  "cat-scratch-post": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Cat Scratch Post

  /* ===== Plants ===== */
  "anubias": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Anubias
  "java-fern": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Java Fern
  "amazon-sword": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Amazon Sword
  "hornwort": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Hornwort
  "cryptocoryne": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Cryptocoryne
  "java-moss": { price: null, stock: null, availability: "", brand: "", keywords: [], createdAt: "" },  // Java Moss
};
