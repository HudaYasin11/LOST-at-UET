

// ========================================
// SUPABASE AUTH IMPORTS
// ========================================

import {
    signup,
    login,
    logout,
    getCurrentUser,
    getCurrentProfile
} from "./auth.js";

console.log("AUTH IMPORTS WORK");
// ========================================
// MODAL CONTROLS
// ========================================

let currentModal = null;

function openModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("active");
        currentModal = id;
        document.body.style.overflow = "hidden";
    }
}

function closeModal() {
    if (currentModal) {
        const modal = document.getElementById(currentModal);

        if (modal) {
            modal.classList.remove("active");
        }

        currentModal = null;
        document.body.style.overflow = "";
    }
}

console.log("MODAL SECTION WORKS");
// ========================================
// CLOSE MODAL WHEN CLICKING OVERLAY
// ========================================

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
        closeModal();
    }
});

// ========================================
// CLOSE MODAL WITH ESCAPE
// ========================================

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal();
    }
});

console.log("MODAL LISTENERS WORK");
// ========================================
// AUTH MODAL
// ========================================

const authButton = document.getElementById("auth-button");
const authModal = document.getElementById("auth-modal");
const authClose = document.getElementById("auth-close");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const authTitle = document.getElementById("auth-title");
const authSwitch = document.getElementById("auth-switch");
const showSignup = document.getElementById("show-signup");

if (authButton) {
    authButton.addEventListener("click", function () {
        openModal("auth-modal");
    });
}

if (authClose) {
    authClose.addEventListener("click", function () {
        closeModal();
    });
}

if (showSignup) {
    showSignup.addEventListener("click", function () {
        loginForm.style.display = "none";
        signupForm.style.display = "block";

        authTitle.textContent = "SIGN UP";

        authSwitch.innerHTML =
            'Already have an account? <button type="button" id="show-login">Login</button>';

        document
            .getElementById("show-login")
            .addEventListener("click", showLoginForm);
    });
}

function showLoginForm() {
    loginForm.style.display = "block";
    signupForm.style.display = "none";

    authTitle.textContent = "LOGIN";

    authSwitch.innerHTML =
        'Don\'t have an account? <button type="button" id="show-signup">Sign Up</button>';

    document
        .getElementById("show-signup")
        .addEventListener("click", function () {
            loginForm.style.display = "none";
            signupForm.style.display = "block";

            authTitle.textContent = "SIGN UP";

            authSwitch.innerHTML =
                'Already have an account? <button type="button" id="show-login">Login</button>';

            document
                .getElementById("show-login")
                .addEventListener("click", showLoginForm);
        });
}

console.log("AUTH MODAL SECTION WORKS");
// ========================================
// LOGIN
// ========================================

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        try {
            await login(email, password);

            alert("Login successful!");

            closeModal();

            window.location.reload();

        } catch (error) {
            alert("Login failed: " + error.message);
        }
    });
}

console.log("LOGIN HANDLER WORKS");
// ========================================
// SIGN UP
// ========================================

if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;

        try {
            await signup(name, email, password);

            alert("Account created successfully!");

            closeModal();

            window.location.reload();

        } catch (error) {
            alert("Signup failed: " + error.message);
        }
    });
}

console.log("SIGNUP HANDLER WORKS");
// ========================================
// CHECK CURRENT USER
// ========================================
async function checkAuthState() {
    try {
        const user = await getCurrentUser();

        if (user) {
            console.log("Logged in as:", user.email);
        } else {
            console.log("No user logged in");
        }
    } catch (error) {
        if (error.message === "Auth session missing!") {
            console.log("No user logged in");
        } else {
            console.error("Auth check failed:", error.message);
        }
    }
}

checkAuthState();
console.log("AUTH STATE CHECK WORKS");

// ========================================
// LOCATION DETAILS
// ========================================

function openLocation(name) {

    const modal =
        document.getElementById("location-modal");

    if (!modal) return;

    const title =
        modal.querySelector("h3");

    const icon =
        modal.querySelector(".modal-icon");

    const badge =
        modal.querySelector(".modal-badge");

    const locationData = {

        "Library": {
            icon: "📚",
            badge: "Academic"
        },

        "CS Department": {
            icon: "💻",
            badge: "Academic"
        },

        "Main Cafe": {
            icon: "☕",
            badge: "Food"
        },

        "Sports Complex": {
            icon: "🏟️",
            badge: "Sports"
        },

        "Mosque": {
            icon: "🕌",
            badge: "Essential"
        },

        "Main Gate": {
            icon: "🚪",
            badge: "Essential"
        },

        "Medical Center": {
            icon: "🏥",
            badge: "Essential"
        },

        "Bus Stop": {
            icon: "🚌",
            badge: "Essential"
        },

        "Hidden Garden": {
            icon: "🌿",
            badge: "Hidden Gem"
        },

        "Admin Building": {
            icon: "🏛️",
            badge: "Academic"
        },

        "Research Lab": {
            icon: "🔬",
            badge: "Academic"
        },

        "Auditorium": {
            icon: "🎭",
            badge: "Academic"
        }

    };

    const data =
        locationData[name] || {
            icon: "📍",
            badge: "Location"
        };

    if (icon) {
        icon.textContent = data.icon;
    }

    if (title) {
        title.textContent = name.toUpperCase();
    }

    if (badge) {
        badge.textContent = data.badge;
    }

    openModal("location-modal");
}


// ========================================
// QR UNLOCK
// ========================================

function triggerUnlock() {

    closeModal();

    setTimeout(function () {

        openModal("qr-modal");

    }, 300);
}

// ========================================
// CATEGORY FILTERING
// ========================================

document
    .querySelectorAll(".filter-btn")
    .forEach(function (btn) {

        btn.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(function (b) {

                        b.classList.remove("active");

                    });

                this.classList.add("active");

                console.log(
                    "Filtering by: " +
                    this.dataset.filter
                );

            }
        );

    });
// // ========================================
// MAP CONTROLS
// ========================================

function zoomMap(direction) {

    console.log(
        "Zoom " + direction
    );
}


function centerMap() {

    console.log(
        "Centering map..."
    );
}


function findMyLocation() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

            function (pos) {

                console.log(
                    "Location:",
                    pos.coords
                );

                alert(
                    "📍 Your location: " +
                    pos.coords.latitude +
                    ", " +
                    pos.coords.longitude
                );

            },

            function () {

                alert(
                    "Unable to get location. Please enable GPS."
                );

            }

        );

    } else {

        alert(
            "Geolocation not supported by your browser."
        );

    }

}
// ========================================
// QUEST FUNCTIONS
// ========================================

function startQuest(name) {

    alert(
        "🎯 Starting quest: " +
        name
    );
}


// Quest filter

document
    .querySelectorAll(
        ".quest-filter .filter-btn"
    )
    .forEach(function (btn) {

        btn.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".quest-filter .filter-btn"
                    )
                    .forEach(function (b) {

                        b.classList.remove(
                            "active"
                        );

                    });

                this.classList.add("active");

            }
        );

    });
    // ========================================
// SAVE FUNCTIONS
// ========================================

function exportSave() {

    const data = {

        xp: 100,

        level: 2,

        discoveries: [
            "CS Department",
            "Main Cafe",
            "Library",
            "Mosque"
        ],

        badges: [
            "Campus Newbie",
            "Caffeine Addict",
            "CS Explorer"
        ]

    };

    const blob = new Blob(
        [
            JSON.stringify(
                data,
                null,
                2
            )
        ],
        {
            type: "application/json"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "lostuet_save_" +
        new Date()
            .toISOString()
            .split("T")[0] +
        ".json";

    a.click();

    URL.revokeObjectURL(url);
}


function importSave(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            try {

                const data =
                    JSON.parse(
                        e.target.result
                    );

                alert(
                    "✅ Save imported successfully!"
                );

                console.log(
                    "Imported data:",
                    data
                );

            } catch (error) {

                alert(
                    "❌ Invalid save file!"
                );

            }

        };

    reader.readAsText(file);
}


function resetGame() {

    if (
        confirm(
            "⚠️ Are you sure you want to reset ALL progress?"
        )
    ) {

        localStorage.removeItem(
            "lostuet_save"
        );

        alert(
            "🔄 Game reset! Refresh the page."
        );

        location.reload();

    }

}


// ========================================
// SEARCH FUNCTIONS
// ========================================

const searchLocations = [

    {
        name: "CS Department",
        icon: "💻",
        category: "Academic",
        unlocked: true
    },

    {
        name: "Central Library",
        icon: "📚",
        category: "Academic",
        unlocked: true
    },

    {
        name: "Main Cafe",
        icon: "☕",
        category: "Food",
        unlocked: true
    },

    {
        name: "Sports Complex",
        icon: "🏟️",
        category: "Sports",
        unlocked: false
    },

    {
        name: "Mosque",
        icon: "🕌",
        category: "Essential",
        unlocked: true
    },

    {
        name: "Hidden Garden",
        icon: "🌿",
        category: "Hidden Gem",
        unlocked: false
    },

    {
        name: "Medical Center",
        icon: "🏥",
        category: "Essential",
        unlocked: false
    },

    {
        name: "Bus Stop",
        icon: "🚌",
        category: "Essential",
        unlocked: false
    },

    {
        name: "Main Gate",
        icon: "🚪",
        category: "Essential",
        unlocked: false
    },

    {
        name: "Admin Building",
        icon: "🏛️",
        category: "Academic",
        unlocked: false
    },

    {
        name: "Research Lab",
        icon: "🔬",
        category: "Academic",
        unlocked: false
    },

    {
        name: "Auditorium",
        icon: "🎭",
        category: "Academic",
        unlocked: false
    }

];


function filterResults() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const query =
        input.value
            .toLowerCase()
            .trim();

    const results =
        document.getElementById("searchResults");

    const noResults =
        document.getElementById("noResults");

    if (!results || !noResults) {
        return;
    }

    if (!query) {

        results.style.display = "grid";
        noResults.style.display = "none";

        return;
    }

    const filtered =
        searchLocations.filter(
            function (loc) {

                return (
                    loc.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    loc.category
                        .toLowerCase()
                        .includes(query)
                );

            }
        );

    if (filtered.length === 0) {

        results.style.display = "none";
        noResults.style.display = "block";

        return;
    }

    results.style.display = "grid";
    noResults.style.display = "none";

    results.innerHTML =
        filtered.map(
            function (loc) {

                return `
                    <div class="search-result-item">
                        <span class="result-icon">${loc.icon}</span>

                        <div class="result-info">
                            <span class="result-name">${loc.name}</span>
                            <span class="result-category">${loc.category}</span>
                        </div>

                        <span class="result-status ${
                            loc.unlocked
                                ? "unlocked"
                                : "locked"
                        }">
                            ${loc.unlocked ? "✅" : "🔒"}
                        </span>
                    </div>
                `;

            }
        ).join("");

    results
        .querySelectorAll(".search-result-item")
        .forEach(function (item, index) {

            item.addEventListener(
                "click",
                function () {

                    openLocation(
                        filtered[index].name
                    );

                }
            );

        });

}


function searchTag(tag) {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (input) {

        input.value = tag;

        filterResults();

    }

}


function clearSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (input) {

        input.value = "";

        filterResults();

    }

}
// ========================================
// QR SCANNER FUNCTIONS
// ========================================

let isScanning = false;

function startScanning() {

    isScanning = true;

    const status =
        document.getElementById("qrStatus");

    if (status) {

        status
            .querySelector(".status-dot")
            .className = "status-dot scanning";

        status
            .querySelector(".status-text")
            .textContent = "Scanning...";
    }

    setTimeout(function () {

        if (isScanning) {
            triggerQRUnlock("CS Department");
        }

    }, 3000);
}


function stopScanning() {

    isScanning = false;

    const status =
        document.getElementById("qrStatus");

    if (status) {

        status
            .querySelector(".status-dot")
            .className = "status-dot idle";

        status
            .querySelector(".status-text")
            .textContent = "Stopped";
    }
}


function triggerQRUnlock(location) {

    stopScanning();

    const placeholder =
        document.querySelector(
            ".qr-scanner-box .qr-placeholder p"
        );

    const icon =
        document.querySelector(
            ".qr-scanner-box .qr-placeholder .qr-camera-icon"
        );

    if (placeholder) {
        placeholder.textContent =
            "✅ Unlocked: " + location + "!";
    }

    if (icon) {
        icon.textContent = "🎉";
    }

    openModal("scan-result-modal");
}
// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener("keydown", function (e) {

    // Ctrl + K / Cmd + K → Focus search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {

        e.preventDefault();

        const searchInput =
            document.getElementById("searchInput");

        if (searchInput) {
            searchInput.focus();
        }
    }

    // Escape → Close modal / clear search
    if (e.key === "Escape") {

        clearSearch();

        const searchInput =
            document.getElementById("searchInput");

        if (searchInput) {
            searchInput.blur();
        }
    }
});


// ========================================
// FINAL INITIALIZATION
// ========================================
// ========================================
// LOAD USER PROFILE
// ========================================

async function loadUserProfile() {

    try {

        const profile = await getCurrentProfile();

        if (!profile) {
            console.log("No profile found.");
            return;
        }

        console.log("User profile loaded:", profile);

        const levelText =
            document.getElementById("level-text");

        const progressText =
            document.getElementById("progress-text");

        const progressBar =
            document.getElementById("mini-progress-bar");

        if (levelText) {
            levelText.textContent =
                `Lv. ${profile.level} Explorer`;
        }

        if (progressText) {
            progressText.textContent =
                `${profile.xp} XP`;
        }

        if (progressBar) {

            const xpForNextLevel = 100;

            const progress =
                Math.min(
                    (profile.xp / xpForNextLevel) * 100,
                    100
                );

            progressBar.style.width =
                `${progress}%`;
        }

    } catch (error) {

        console.error(
            "Failed to load profile:",
            error.message
        );
    }
}


// Load profile when app starts
loadUserProfile();
console.log("LOST@UET app initialized successfully.");