/* =====================================================================
   VIMAL OFFERS - the ONE place to edit your offers.
   Used by: offers.html (the list of offers) and the home-page offer popup.
   - start / end : YYYY-MM-DD (the end date is included)
   - cats        : pets, aquarium, food, accessories, toys
   - Keep pct / max / flat / min identical to the coupon rows in supabase-coupons.sql.
   - Festival dates change every year, so check them each season.
   ===================================================================== */
window.VIMAL_OFFERS = [
 {name:"Diwali Dhamaka", emoji:"🪔", start:"2026-11-01", end:"2026-11-11", c1:"#ff9933", c2:"#b3122d",
  deal:"15% off, up to ₹5,000", code:"DIWALI15", pct:15, max:5000, min:0, shop:["pets","aquarium","food","accessories","toys"], extra:"Keep pets indoors and calm during crackers",
  cats:["pets","aquarium","food","accessories","toys"], link:"pets.html"},
 {name:"Christmas Joy", emoji:"🎄", start:"2026-12-15", end:"2026-12-26", c1:"#16a34a", c2:"#991b1b",
  deal:"12% off, up to ₹1,500", code:"XMAS12", pct:12, max:1500, min:0, on:"Toys, Accessories and Aquariums",
  cats:["toys","accessories","aquarium"], link:"toys.html"},
 {name:"New Year Bash", emoji:"🎉", start:"2026-12-28", end:"2027-01-03", c1:"#7c3aed", c2:"#0ea5e9",
  deal:"10% off, up to ₹1,000", code:"NEWYEAR10", pct:10, max:1000, min:999, on:"Accessories and Pet Foods",
  cats:["accessories","food"], link:"accessories.html"},
 {name:"Pongal Special", emoji:"🌾", start:"2027-01-12", end:"2027-01-17", c1:"#f59e0b", c2:"#15803d",
  deal:"20% off pet food, up to ₹1,000", code:"PONGAL20", pct:20, max:1000, min:0, on:"Pet Foods",
  cats:["food"], link:"foods.html"},
 {name:"Republic Day Sale", emoji:"🇮🇳", start:"2027-01-24", end:"2027-01-26", c1:"#f97316", c2:"#16a34a",
  deal:"Flat ₹300 off orders above ₹2,000", code:"REPUBLIC300", flat:300, min:2000, on:"Pet Foods, Accessories and Toys",
  cats:["food","accessories","toys"], link:"marketplace.html"},
 {name:"Holi Colours", emoji:"🎨", start:"2027-03-20", end:"2027-03-23", c1:"#ec4899", c2:"#f59e0b",
  deal:"20% off toys, up to ₹1,000", code:"HOLI20", pct:20, max:1000, min:0, on:"Toys",
  cats:["toys"], link:"toys.html"},
 {name:"Tamil New Year", emoji:"🌸", start:"2027-04-12", end:"2027-04-16", c1:"#eab308", c2:"#059669",
  deal:"10% off aquarium range, up to ₹2,000", code:"PUTHANDU", pct:10, max:2000, min:0, on:"Aquariums, Fish, Plants and Accessories",
  cats:["aquarium","accessories"], link:"aquariums.html"}
];
