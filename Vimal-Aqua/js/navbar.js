// ================= MOBILE MENU =================

function openMenu() {
    document.getElementById("mobileMenu").style.left = "0";
}

function closeMenu() {
    document.getElementById("mobileMenu").style.left = "-280px";
}

// ================= SEARCH =================

function searchWebsite() {

    let search = document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    if (search === "") {
        alert("Please enter something to search.");
        return;
    }

    if (search.includes("fish")) {
        window.location.href = "fish.html";
    }
    else if (search.includes("bird")) {
        window.location.href = "birds.html";
    }
    else if (search.includes("dog")) {
        window.location.href = "dogs.html";
    }
    else if (search.includes("cat")) {
        window.location.href = "cats.html";
    }
    else if (search.includes("small")) {
        window.location.href = "small-pets.html";
    }
    else if (search.includes("food")) {
        window.location.href = "foods.html";
    }
    else if (search.includes("accessory")) {
        window.location.href = "accessories.html";
    }
    else if (search.includes("aquarium")) {
        window.location.href = "aquariums.html";
    }
    else if (search.includes("about")) {
        window.location.href = "about.html";
    }
    else if (search.includes("contact")) {
        window.location.href = "contact.html";
    }
    else {
        alert("No matching products found.");
    }

}