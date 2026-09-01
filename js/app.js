// ========================================
// LOST@UET - Main Application
// ========================================

// ========================================
// MODAL CONTROLS
// ========================================
let currentModal = null;

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        currentModal = id;
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (currentModal) {
        const modal = document.getElementById(currentModal);
        if (modal) modal.classList.remove('active');
        currentModal = null;
        document.body.style.overflow = '';
    }
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ========================================
// LOCATION DETAILS
// ========================================
function openLocation(name) {
    const modal = document.getElementById('location-modal');
    if (!modal) return;

    const title = modal.querySelector('h3');
    const icon = modal.querySelector('.modal-icon');
    const badge = modal.querySelector('.modal-badge');

    const locationData = {
        'Library': { icon: '📚', badge: 'Academic' },
        'CS Department': { icon: '💻', badge: 'Academic' },
        'Main Cafe': { icon: '☕', badge: 'Food' },
        'Sports Complex': { icon: '🏟️', badge: 'Sports' },
        'Mosque': { icon: '🕌', badge: 'Essential' },
        'Main Gate': { icon: '🚪', badge: 'Essential' },
        'Medical Center': { icon: '🏥', badge: 'Essential' },
        'Bus Stop': { icon: '🚌', badge: 'Essential' },
        'Hidden Garden': { icon: '🌿', badge: 'Hidden Gem' },
        'Admin Building': { icon: '🏛️', badge: 'Academic' },
        'Research Lab': { icon: '🔬', badge: 'Academic' },
        'Auditorium': { icon: '🎭', badge: 'Academic' }
    };

    const data = locationData[name] || { icon: '📍', badge: 'Location' };

    if (icon) icon.textContent = data.icon;
    if (title) title.textContent = name.toUpperCase();
    if (badge) badge.textContent = data.badge;

    openModal('location-modal');
}

// ========================================
// QR UNLOCK
// ========================================
function triggerUnlock() {
    closeModal();
    setTimeout(function() {
        openModal('qr-modal');
    }, 300);
}

// ========================================
// CATEGORY FILTERING
// ========================================
document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
        console.log('Filtering by: ' + this.dataset.filter);
    });
});

// ========================================
// MAP CONTROLS
// ========================================
function zoomMap(direction) {
    console.log('Zoom ' + direction);
}

function centerMap() {
    console.log('Centering map...');
}

function findMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                console.log('Location:', pos.coords);
                alert('📍 Your location: ' + pos.coords.latitude + ', ' + pos.coords.longitude);
            },
            function() {
                alert('Unable to get location. Please enable GPS.');
            }
        );
    } else {
        alert('Geolocation not supported by your browser.');
    }
}

// ========================================
// QUEST FUNCTIONS
// ========================================
function startQuest(name) {
    alert('🎯 Starting quest: ' + name);
}

// Quest filter
document.querySelectorAll('.quest-filter .filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.quest-filter .filter-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// ========================================
// SAVE FUNCTIONS
// ========================================
function exportSave() {
    const data = {
        xp: 100,
        level: 2,
        discoveries: ['CS Department', 'Main Cafe', 'Library', 'Mosque'],
        badges: ['Campus Newbie', 'Caffeine Addict', 'CS Explorer']
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lostuet_save_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importSave(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            alert('✅ Save imported successfully!');
            console.log('Imported data:', data);
        } catch (error) {
            alert('❌ Invalid save file!');
        }
    };
    reader.readAsText(file);
}

function resetGame() {
    if (confirm('⚠️ Are you sure you want to reset ALL progress?')) {
        localStorage.removeItem('lostuet_save');
        alert('🔄 Game reset! Refresh the page.');
        location.reload();
    }
}

// ========================================
// SEARCH FUNCTIONS
// ========================================
const searchLocations = [
    { name: 'CS Department', icon: '💻', category: 'Academic', unlocked: true },
    { name: 'Central Library', icon: '📚', category: 'Academic', unlocked: true },
    { name: 'Main Cafe', icon: '☕', category: 'Food', unlocked: true },
    { name: 'Sports Complex', icon: '🏟️', category: 'Sports', unlocked: false },
    { name: 'Mosque', icon: '🕌', category: 'Essential', unlocked: true },
    { name: 'Hidden Garden', icon: '🌿', category: 'Hidden Gem', unlocked: false },
    { name: 'Medical Center', icon: '🏥', category: 'Essential', unlocked: false },
    { name: 'Bus Stop', icon: '🚌', category: 'Essential', unlocked: false },
    { name: 'Main Gate', icon: '🚪', category: 'Essential', unlocked: false },
    { name: 'Admin Building', icon: '🏛️', category: 'Academic', unlocked: false },
    { name: 'Research Lab', icon: '🔬', category: 'Academic', unlocked: false },
    { name: 'Auditorium', icon: '🎭', category: 'Academic', unlocked: false }
];

function filterResults() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const query = input.value.toLowerCase().trim();
    const results = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');

    if (!results || !noResults) return;

    if (!query) {
        results.style.display = 'grid';
        noResults.style.display = 'none';
        return;
    }

    const filtered = searchLocations.filter(function(loc) {
        return loc.name.toLowerCase().includes(query) ||
               loc.category.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
        results.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    results.style.display = 'grid';
    noResults.style.display = 'none';

    results.innerHTML = filtered.map(function(loc) {
        return '<div class="search-result-item" onclick="openLocation(\'' + loc.name + '\')">' +
            '<span class="result-icon">' + loc.icon + '</span>' +
            '<div class="result-info">' +
                '<span class="result-name">' + loc.name + '</span>' +
                '<span class="result-category">' + loc.category + '</span>' +
            '</div>' +
            '<span class="result-status ' + (loc.unlocked ? 'unlocked' : 'locked') + '">' + (loc.unlocked ? '✅' : '🔒') + '</span>' +
        '</div>';
    }).join('');
}

function searchTag(tag) {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = tag;
        filterResults();
    }
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = '';
        filterResults();
    }
}

// ========================================
// QR SCANNER FUNCTIONS
// ========================================
let isScanning = false;

function startScanning() {
    isScanning = true;
    const status = document.getElementById('qrStatus');
    if (status) {
        status.querySelector('.status-dot').className = 'status-dot scanning';
        status.querySelector('.status-text').textContent = 'Scanning...';
    }

    setTimeout(function() {
        if (isScanning) {
            triggerQRUnlock('CS Department');
        }
    }, 3000);
}

function stopScanning() {
    isScanning = false;
    const status = document.getElementById('qrStatus');
    if (status) {
        status.querySelector('.status-dot').className = 'status-dot idle';
        status.querySelector('.status-text').textContent = 'Stopped';
    }
}

function triggerQRUnlock(location) {
    stopScanning();
    const placeholder = document.querySelector('.qr-scanner-box .qr-placeholder p');
    const icon = document.querySelector('.qr-scanner-box .qr-placeholder .qr-camera-icon');
    if (placeholder) placeholder.textContent = '✅ Unlocked: ' + location + '!';
    if (icon) icon.textContent = '🎉';
    openModal('scan-result-modal');
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', function(e) {
    // Ctrl+K or Cmd+K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        } else {
            window.location.href = 'search.html';
        }
    }
    if (e.key === 'Escape') {
        clearSearch();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.blur();
    }
});

// ========================================
// INITIALIZE
// ========================================
console.log('🏛️ LOST@UET initialized!');
console.log('📱 Keyboard shortcuts:');
console.log('  Ctrl+K: Search');
console.log('  Escape: Close modals / Clear search');

console.log('💡 Try: triggerUnlock() in console to demo QR scan');