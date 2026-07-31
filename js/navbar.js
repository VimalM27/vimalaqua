// ================= MOBILE MENU =================

function openMenu() {
    document.getElementById("mobileMenu").style.left = "0";
}

function closeMenu() {
    document.getElementById("mobileMenu").style.left = "-280px";
}

// ================= DROPDOWN =================

function toggleDropdown(event, trigger) {
    event.preventDefault();
    event.stopPropagation();

    const content = trigger.nextElementSibling;
    const isOpen = content && content.classList.contains("show");

    document.querySelectorAll(".dropdown-content.show").forEach(el => {
        el.classList.remove("show");
    });

    if (!isOpen && content) {
        content.classList.add("show");
    }
}

document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown-content.show").forEach(el => {
            el.classList.remove("show");
        });
    }
});

// ================= SEARCH =================

function searchWebsite() {
    const input = document.getElementById("searchInput");
    if (!input) {
        return;
    }

    let search = input.value.toLowerCase().trim();

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

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                searchWebsite();
            }
        });
    }
});