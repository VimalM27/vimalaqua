function addToCart(name, price){

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
        name:name,
        price:price
    });

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    alert(name + " added to cart");
}
const fishes = [

{
name:"Koi Fish",
price:500,
image:"images/koi.jpg"
},

{
name:"Butterfly Koi",
price:700,
image:"images/butterfly-koi.jpg"
},

{
name:"Gold Fish",
price:100,
image:"images/goldfish.jpg"
},

{
name:"Oranda Gold Fish",
price:350,
image:"images/oranda.jpg"
},

{
name:"Black Moor",
price:250,
image:"images/blackmoor.jpg"
},

{
name:"Angel Fish",
price:150,
image:"images/angel.jpg"
},

{
name:"Koi Angel",
price:250,
image:"images/koiangel.jpg"
},

{
name:"Betta Fish",
price:250,
image:"images/betta.jpg"
},

{
name:"Halfmoon Betta",
price:450,
image:"images/halfmoon.jpg"
},

{
name:"Crowntail Betta",
price:400,
image:"images/crowntail.jpg"
},

{
name:"Guppy",
price:80,
image:"images/guppy.jpg"
},

{
name:"Moscow Guppy",
price:150,
image:"images/moscow.jpg"
},

{
name:"Molly",
price:70,
image:"images/molly.jpg"
},

{
name:"Black Molly",
price:100,
image:"images/blackmolly.jpg"
},

{
name:"Platy",
price:60,
image:"images/platy.jpg"
},

{
name:"Swordtail",
price:80,
image:"images/swordtail.jpg"
},

{
name:"Neon Tetra",
price:50,
image:"images/neontetra.jpg"
},

{
name:"Cherry Barb",
price:70,
image:"images/cherrybarb.jpg"
},

{
name:"Pearl Gourami",
price:200,
image:"images/gourami.jpg"
},

{
name:"Oscar Fish",
price:450,
image:"images/oscar.jpg"
},

{
name:"Flowerhorn",
price:1500,
image:"images/flowerhorn.jpg"
},

{
name:"Silver Arowana",
price:3000,
image:"images/arowana.jpg"
}

];

const container =
document.getElementById("fish-container");

if(container){

let html = "";

fishes.forEach(fish => {

html += `
<div class="product-card">

<img src="${fish.image}" alt="${fish.name}">

<h2>${fish.name}</h2>

<p class="price">₹${fish.price}</p>

<button onclick="addToCart('${fish.name}',${fish.price})">
Add to Cart
</button>

</div>
`;

});

container.innerHTML = html;

}

function addToCart(name, price, image) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            qty: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Added to cart!");
}