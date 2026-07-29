// ============================================================
// AUTH.JS
// Include this (after firebase SDK + firebase-config.js) on
// EVERY page that has the navbar, so the corner profile/login
// state stays correct site-wide.
// ============================================================

// ---------- SIGN UP ----------
function signUpUser(name, email, phone, password) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then(function (credential) {
            const user = credential.user;

            // Set the display name so the navbar can show it instantly
            return user.updateProfile({ displayName: name }).then(function () {
                // Store extra profile info in Firestore
                return db.collection("users").doc(user.uid).set({
                    name: name,
                    email: email,
                    phone: phone,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        });
}

// ---------- LOGIN ----------
function loginUser(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

// ---------- LOGOUT ----------
function logoutUser() {
    auth.signOut().then(function () {
        window.location.href = "index.html";
    });
}

// ---------- NAVBAR UI (runs on every page) ----------
function getInitial(nameOrEmail) {
    return (nameOrEmail || "?").trim().charAt(0).toUpperCase();
}

function renderLoggedOutNav() {
    const desktop = document.getElementById("userActions");
    const mobile = document.getElementById("mobileLoginLink");

    if (desktop) {
        desktop.innerHTML = `<a href="login.html" class="login-link">👤 Login</a>`;
    }
    if (mobile) {
        mobile.outerHTML = `<a href="login.html" class="mobile-login" id="mobileLoginLink">👤</a>`;
    }
}

function renderLoggedInNav(user) {
    const displayName = user.displayName || user.email.split("@")[0];
    const initial = getInitial(displayName);

    const desktop = document.getElementById("userActions");
    const mobile = document.getElementById("mobileLoginLink");

    if (desktop) {
        desktop.innerHTML = `
            <div class="profile-menu">
                <button class="profile-btn" onclick="toggleProfileMenu()">
                    <span class="profile-avatar">${initial}</span>
                    <span class="profile-name">${displayName}</span>
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="profile-info">
                        <strong>${displayName}</strong>
                        <small>${user.email}</small>
                    </div>
                    <a href="#" onclick="logoutUser(); return false;">Logout</a>
                </div>
            </div>
        `;
    }

    if (mobile) {
        mobile.outerHTML = `
            <a href="#" class="mobile-login" id="mobileLoginLink" onclick="toggleProfileMenu(); return false;">
                <span class="profile-avatar">${initial}</span>
            </a>
        `;
    }
}

function toggleProfileMenu() {
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

document.addEventListener("click", function (event) {
    if (!event.target.closest(".profile-menu")) {
        const dropdown = document.getElementById("profileDropdown");
        if (dropdown) dropdown.classList.remove("show");
    }
});

// ---------- WATCH AUTH STATE (fires on every page load) ----------
auth.onAuthStateChanged(function (user) {
    if (user) {
        renderLoggedInNav(user);
    } else {
        renderLoggedOutNav();
    }
});
