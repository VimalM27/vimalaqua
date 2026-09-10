// ============================================================
// AUTH.JS  (Supabase version)
// Include this AFTER the Supabase CDN script + js/supabaseClient.js
// on EVERY page that has the navbar, so the corner profile/login
// state stays correct site-wide.
// ============================================================
 
// ---------- SIGN UP ----------
function signUpUser(name, email, phone, password) {
    return supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name,
                phone: phone
            }
        }
    }).then(function (result) {
        if (result.error) throw result.error;
        return result.data;
    });
}
 
// ---------- LOGIN ----------
function loginUser(email, password) {
    return supabaseClient.auth.signInWithPassword({ email, password })
        .then(function (result) {
            if (result.error) throw result.error;
            return result.data;
        });
}
 
// ---------- LOGOUT ----------
function logoutUser() {
    supabaseClient.auth.signOut().then(function () {
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
    const displayName = (user.user_metadata && user.user_metadata.name) || user.email.split("@")[0];
    const initial = getInitial(displayName);
 
    const desktop = document.getElementById("userActions");
    const mobile = document.getElementById("mobileLoginLink");
 
    if (desktop) {
    desktop.innerHTML = `
        <div class="profile-menu">
            <button class="profile-btn" onclick="toggleProfileMenu()">
                <span class="profile-avatar">${initial}</span>
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
supabaseClient.auth.onAuthStateChange(function (event, session) {
    if (session && session.user) {
        renderLoggedInNav(session.user);
    } else {
        renderLoggedOutNav();
    }
});
 