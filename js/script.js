function parsePrice(price) {
    if (typeof price === "number" && Number.isFinite(price)) {
        return price;
    }

    if (typeof price === "string") {
        const cleaned = price.replace(/[^\d.]/g, "");
        const parsed = parseFloat(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function addToCart(name, price, image) {
    const parsedPrice = parsePrice(price);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            name: name,
            price: parsedPrice,
            image: image || "",
            qty: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(name + " added to cart");
}

const searchItems = [
    { label: "Koi Fish", page: "fish.html" },
    { label: "Gold Fish", page: "fish.html" },
    { label: "Angel Fish", page: "fish.html" },
    { label: "Betta Fish", page: "fish.html" },
    { label: "Guppy", page: "fish.html" },
    { label: "Sailfin Molly", page: "fish.html" },
    { label: "Platy", page: "fish.html" },
    { label: "Swordtail", page: "fish.html" },
    { label: "Discus Fish", page: "fish.html" },
    { label: "Oscar Fish", page: "fish.html" },
    { label: "Flowerhorn", page: "fish.html" },
    { label: "Silver Arowana", page: "fish.html" },
    { label: "Aquariums", page: "aquariums.html" },
    { label: "Plants", page: "plants.html" },
    { label: "Pet Foods", page: "foods.html" },
    { label: "Accessories", page: "accessories.html" },
    { label: "Dogs", page: "dogs.html" },
    { label: "Cats", page: "cats.html" },
    { label: "Birds", page: "birds.html" },
    { label: "Small Pets", page: "small-pets.html" },
    { label: "Pets", page: "pets.html" }
];

function getCurrentPageName() {
    return window.location.pathname.split("/").pop().split("?")[0] || "index.html";
}

function getSearchSuggestions(query) {
    const term = (query || "").toLowerCase().trim();

    if (!term) {
        return [];
    }

    const currentPage = getCurrentPageName();
    const pageProducts = Array.from(document.querySelectorAll(".product-card h2"))
        .map(node => node.textContent.trim())
        .filter(Boolean);

    const pageSpecific = pageProducts
        .filter(name => name.toLowerCase().includes(term))
        .map(name => ({ label: name, page: currentPage }));

    if (pageSpecific.length) {
        return pageSpecific.slice(0, 8);
    }

    return searchItems
        .filter(item => item.label.toLowerCase().includes(term))
        .slice(0, 8);
}

function renderSearchSuggestions(query) {
    const suggestionsBox = document.getElementById("searchSuggestions");

    if (!suggestionsBox) {
        return;
    }

    const matches = getSearchSuggestions(query);

    if (!matches.length) {
        suggestionsBox.innerHTML = "";
        suggestionsBox.classList.remove("show");
        return;
    }

    suggestionsBox.innerHTML = matches.map(item => `
        <button type="button" class="search-suggestion-item" data-page="${item.page}" data-label="${item.label}">
            ${item.label}
        </button>
    `).join("");

    suggestionsBox.classList.add("show");
}

function highlightProduct(label) {
    const cards = Array.from(document.querySelectorAll(".product-card"));
    const target = cards.find(card => card.textContent.includes(label));

    if (!target) {
        return false;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("highlight-product");
    setTimeout(() => target.classList.remove("highlight-product"), 2200);
    return true;
}

function navigateToSearchItem(page, label) {
    const currentPage = getCurrentPageName();

    if (page && page !== currentPage) {
        window.location.href = page;
        return;
    }

    if (label) {
        const found = highlightProduct(label);
        if (!found) {
            window.location.href = currentPage;
        }
    }
}

function searchProducts() {
    const input = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";

    if (!input) {
        alert("Please enter a search term.");
        return;
    }

    const matches = getSearchSuggestions(input);

    if (matches.length) {
        const firstMatch = matches[0];
        navigateToSearchItem(firstMatch.page, firstMatch.label);
    } else {
        alert("No matching product found.");
    }
}

window.searchProducts = searchProducts;
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

function openImagePopup(imageSrc){
    document.getElementById("popupImage").src = imageSrc;
    document.getElementById("imagePopup").style.display = "flex";
}

function closeImagePopup(){
    document.getElementById("imagePopup").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function(){
    const images = document.querySelectorAll(".product-card img");

    images.forEach(img => {
        img.addEventListener("click", function(){
            openImagePopup(this.src);
        });
    });

    document.querySelectorAll(".product-card button").forEach(button => {
        if (button.getAttribute("data-cart-bound") === "true" || button.onclick) {
            return;
        }

        const card = button.closest(".product-card");
        if (!card) {
            return;
        }

        const name = button.dataset.name || card.querySelector("h2")?.textContent?.trim() || "";
        const price = button.dataset.price || card.querySelector(".price")?.textContent?.trim() || "0";
        const image = button.dataset.image || card.querySelector("img")?.getAttribute("src") || "";

        button.setAttribute("data-cart-bound", "true");
        button.addEventListener("click", function(){
            if (button.textContent.trim().toLowerCase().includes("contact for price")) {
                return;
            }
            addToCart(name, price, image);
        });
    });

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.querySelector(".search-box button");
    const suggestionsBox = document.getElementById("searchSuggestions");

    if (searchInput) {
        searchInput.addEventListener("input", function(){
            renderSearchSuggestions(this.value);
        });

        searchInput.addEventListener("focus", function(){
            renderSearchSuggestions(this.value);
        });

        searchInput.addEventListener("keydown", function(event){
            if (event.key === "Enter") {
                event.preventDefault();
                searchProducts();
            }

            if (event.key === "Escape") {
                suggestionsBox?.classList.remove("show");
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener("click", function(event){
            event.preventDefault();
            searchProducts();
        });
    }

    if (suggestionsBox) {
        suggestionsBox.addEventListener("click", function(event){
            const suggestionButton = event.target.closest(".search-suggestion-item");

            if (suggestionButton) {
                event.preventDefault();
                navigateToSearchItem(suggestionButton.dataset.page, suggestionButton.dataset.label);
            }
        });
    }

    document.addEventListener("click", function(event){
        if (!event.target.closest(".search-box")) {
            suggestionsBox?.classList.remove("show");
        }
    });
});
