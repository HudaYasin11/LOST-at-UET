<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Quests - LOST@UET</title>

    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link rel="stylesheet" href="css/style.css" />
    
    <style>
        /* ✅ HIDE completed quests */
        .quest-card.hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <div id="app">

        <!-- HEADER -->
        <header id="global-header">
            <div class="header-left">
                <span class="logo-icon">🏛️</span>
                <span class="logo-text">LOST@UET</span>
            </div>
            <nav class="header-nav">
                <a href="home.html">Home</a>
                <a href="map.html">Map</a>
                <a href="quests.html" class="active">Quests</a>
                <a href="discoveries.html">Discoveries</a>
            </nav>
            <div class="header-profile" id="userProfile">
                <div class="avatar">👤</div>
                <div class="profile-info">
                    <span class="level-text" id="userDisplayName">Loading...</span>
                    <div class="mini-progress">
                        <div class="mini-progress-bar" id="userProgressBar" style="width:0%;"></div>
                    </div>
                    <span class="progress-text" id="userProgressText">0/42</span>
                </div>
            </div>
        </header>

        <!-- QUESTS PAGE -->
        <section class="page active">
            <div class="page-header">
                <h2>🏆 ACTIVE QUESTS</h2>
                <div class="level-bar">
                    <span>⭐ <span id="questXP">0</span> XP</span>
                    <span>📍 <span id="questDiscoveries">0</span>/<span id="questTotal">0</span></span>
                </div>
            </div>

            <!-- Quest Stats -->
            <div class="quest-stats">
                <div class="quest-stat">
                    <span class="stat-number" id="activeQuests">0</span>
                    <span class="stat-label">Active</span>
                </div>
                <div class="quest-stat">
                    <span class="stat-number" id="completedQuests">0</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="quest-stat">
                    <span class="stat-number" id="totalQuestXP">0</span>
                    <span class="stat-label">Total XP</span>
                </div>
            </div>

            <!-- Quest Filter -->
            <div class="quest-filter">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="active">Active</button>
                <button class="filter-btn" data-filter="completed">Completed</button>
            </div>

            <!-- Quest List -->
            <div class="quest-list" id="questsContainer">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p style="margin-top:12px;color:var(--text-muted);">Loading quests...</p>
                </div>
            </div>
        </section>

        <!-- BOTTOM NAV -->
        <nav class="bottom-nav">
            <a href="home.html"><i class="fas fa-home"></i> Home</a>
            <a href="map.html"><i class="fas fa-map"></i> Map</a>
            <a href="quests.html" class="active"><i class="fas fa-tasks"></i> Quests</a>
            <a href="discoveries.html"><i class="fas fa-trophy"></i> Discoveries</a>
        </nav>

        <nav class="mobile-nav">
            <a href="home.html"><i class="fas fa-home"></i> Home</a>
            <a href="map.html"><i class="fas fa-map"></i> Map</a>
            <a href="quests.html" class="active"><i class="fas fa-tasks"></i> Quests</a>
            <a href="discoveries.html"><i class="fas fa-trophy"></i> Discoveries</a>
        </nav>

    </div>

    <script type="module">
        import { getCurrentUser } from './js/auth.js';
        import { 
            loadGameData, 
            getState, 
            getTotalXP, 
            getLevel, 
            getTotalDiscoveries, 
            getTotalLocations, 
            getQuestProgress, 
            completeQuest, 
            refreshUserData,
            refreshQuests,
            getCompletionPercentage,
            subscribe
        } from './js/dataService.js';
        import { getQuests } from './js/api.js';

        // ========================================
        // STATE
        // ========================================
        let questFilter = 'all';
        let allQuests = [];

        // ========================================
        // DOM REFS
        // ========================================
        const questsContainer = document.getElementById('questsContainer');

        // ========================================
        // SUBSCRIBE TO STATE CHANGES
        // ========================================
        subscribe((state) => {
            console.log('🔄 Quests page: State changed!');
            allQuests = state.quests || [];
            updateHeader();
            updateStats();
            renderQuests();
        });

        // ========================================
        // LOAD DATA
        // ========================================
        async function loadData() {
            try {
                const user = await getCurrentUser();
                if (!user || !user.success) {
                    window.location.href = 'index.html';
                    return;
                }

                await loadGameData();
                const state = getState();
                allQuests = state.quests || [];
                
                updateHeader();
                updateStats();
                renderQuests();
                
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        // ========================================
        // UPDATE HEADER
        // ========================================
        function updateHeader() {
            const state = getState();
            const user = state.user;
            const discoveries = getTotalDiscoveries();
            const total = getTotalLocations();
            const progress = getCompletionPercentage();

            const displayName = document.getElementById('userDisplayName');
            const progressBar = document.getElementById('userProgressBar');
            const progressText = document.getElementById('userProgressText');

            if (displayName) {
                displayName.textContent = user?.name || user?.username || 'Explorer';
            }
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            if (progressText) {
                progressText.textContent = `${discoveries}/${total}`;
            }
        }

        // ========================================
        // UPDATE STATS
        // ========================================
        function updateStats() {
            document.getElementById('questXP').textContent = getTotalXP();
            document.getElementById('questDiscoveries').textContent = getTotalDiscoveries();
            document.getElementById('questTotal').textContent = getTotalLocations();

            const completed = allQuests.filter(q => getQuestProgress(q.id) === 100);
            const active = allQuests.filter(q => getQuestProgress(q.id) > 0 && getQuestProgress(q.id) < 100);
            
            document.getElementById('activeQuests').textContent = active.length;
            document.getElementById('completedQuests').textContent = completed.length;
            document.getElementById('totalQuestXP').textContent = completed.reduce((sum, q) => sum + (q.xp || 0), 0);
        }

        // ========================================
        // RENDER QUESTS - HIDE COMPLETED
        // ========================================
        function renderQuests() {
            if (!questsContainer) return;

            let filtered = allQuests;
            if (questFilter === 'active') {
                filtered = allQuests.filter(q => getQuestProgress(q.id) > 0 && getQuestProgress(q.id) < 100);
            } else if (questFilter === 'completed') {
                filtered = allQuests.filter(q => getQuestProgress(q.id) === 100);
            }

            // ✅ Also filter out completed quests for "All" view if we want
            // For now, we show completed with a "hidden" class

            if (filtered.length === 0) {
                questsContainer.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">🎯</span>
                        <p>No quests available</p>
                        <p style="font-size:12px;color:var(--text-muted);">You've completed all quests! 🎉</p>
                    </div>
                `;
                return;
            }

            questsContainer.innerHTML = filtered.map(quest => {
                const progress = getQuestProgress(quest.id);
                const completed = progress === 100;
                
                // ✅ HIDE completed quests
                const hiddenClass = completed ? 'hidden' : '';
                
                return `
                    <div class="quest-card ${completed ? 'completed' : ''} ${hiddenClass}">
                        <div class="quest-icon">${quest.icon || '📋'}</div>
                        <div class="quest-content">
                            <h4>${quest.title || quest.name || 'Quest'}</h4>
                            <p>${quest.description || 'Complete this quest to earn XP!'}</p>
                            <div class="quest-meta">
                                <span class="quest-progress">${completed ? '✅ Completed' : '🔄 ' + progress + '%'}</span>
                                <span class="quest-reward">+${quest.xp || 0} XP</span>
                                <div class="quest-progress-bar">
                                    <div class="quest-progress-fill" style="width:${progress}%;"></div>
                                </div>
                            </div>
                        </div>
                        ${completed 
                            ? '<span class="quest-done">✅ Done</span>' 
                            : `<button class="quest-arrow" onclick="window.completeQuest('${quest.id}')">></button>`
                        }
                    </div>
                `;
            }).join('');
        }

        // ========================================
        // COMPLETE QUEST
        // ========================================
        window.completeQuest = async function(questId) {
            try {
                const result = await completeQuest(questId);
                if (result.success) {
                    alert('🎉 Quest completed! +' + (result.data?.xp_awarded || 0) + ' XP');
                    await refreshUserData();
                    await refreshQuests();
                    await loadGameData();
                    updateStats();
                    renderQuests();
                } else {
                    alert('❌ Failed to complete quest: ' + (result.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Complete quest error:', error);
                alert('❌ Failed to complete quest');
            }
        };

        // ========================================
        // FILTERS
        // ========================================
        document.querySelectorAll('.quest-filter .filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quest-filter .filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                questFilter = this.dataset.filter;
                renderQuests();
            });
        });

        // ========================================
        // INIT
        // ========================================
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadData);
        } else {
            loadData();
        }
    </script>
</body>
</html>