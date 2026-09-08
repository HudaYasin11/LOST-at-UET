// ========================================
// RIDDLE-BASED QUEST DATA
// ========================================

export const questsData = [
    {
        id: 1,
        title: 'The Hidden Temple of Knowledge',
        icon: '📚',
        xp_reward: 150,
        location_id: 'national-library',
        category: 'hidden',
        is_active: true,
        is_disclosed: false,
        answer: 'National Library',
        clues: [
            {
                order: 1,
                text: 'I stand where silence is golden, and wisdom never grows old. Students come to seek and find, knowledge of every kind.'
            },
            {
                order: 2,
                text: 'Near the main gate I reside, with thousands of books inside. If you need to study or explore, this is the place to restore.'
            }
        ],
        hint: '📍 Look for the largest building with books.',
        completionMessage: ' You\'ve unlocked the temple of knowledge! The library is now your second home. May your wisdom grow!',
       
    },
    {
        id: 2,
        title: ' The Infamous Drink',
        icon: '🧋',
        xp_reward: 200,
        location_id: 'annex',
        category: 'food',
        is_active: true,
        is_disclosed: false,
        answer: 'Panga Shake',
        clues: [
            {
                order: 1,
                text: 'its often used as a traditional drink given to the juniors by their seniors'
            },
            {
                order: 2,
                text: 'it is origionally available at the cafe near the automotive dept'
            }
        ],
        hint: 'its at annexe and bhola as well',
        completionMessage: 'If your seniors did not treat you go treat yourself to the heavenly goodness',
        completionIcon: ''
    },
    {
        id: 3,
        title: ' The Caffeine Hideout',
        icon: '☕',
        xp_reward: 100,
        location_id: 'bhola-cafe',
        category: 'food',
        is_active: true,
        is_disclosed: false,
        answer: 'Bhola Cafe',
        clues: [
            {
                order: 1,
                text: 'When deadlines loom and sleep is rare, students come to find me there. The smell of beans fills the air, and tired souls find repair.'
            },
            {
                order: 2,
                text: 'Near the sports ground I am found, where hungry students gather round. My name is known to all who stay, to fuel their work throughout the day.'
            }
        ],
        hint: '📍 Look for the place that serves coffee.',
        completionMessage: ' Ah, the perfect brew! You\'ve found the Caffeine Hideout. Now you know where to go when deadlines strike!',
        completionIcon: ''
    },
    {
        id: 4,
        title: 'The Arena of Champions',
        icon: '🏟️',
        xp_reward: 180,
        location_id: 'sports-complex',
        category: 'sports',
        is_active: true,
        is_disclosed: false,
        answer: 'Sports Complex',
        clues: [
            {
                order: 1,
                text: 'Where cheers echo and victories are won, under the bright and blazing sun. The fittest come to play and fight, from morning until the night.'
            },
            {
                order: 2,
                text: 'Beyond the main block I am seen, where athletes train and keep their dream. With fields so green and tracks so fast, my glory forever lasts.'
            }
        ],
        hint: '📍 Look for the place with sports fields.',
        completionMessage: ' You\'ve entered the Arena of Champions! Time to get active and make your mark on campus sports!',
        completionIcon: ''
    },
    {
        id: 5,
        title: 'The Peaceful Sanctuary',
        icon: '🕌',
        xp_reward: 120,
        location_id: 'mosque',
        category: 'essential',
        is_active: true,
        is_disclosed: false,
        answer: 'Mosque',
        clues: [
            {
                order: 1,
                text: 'Where hearts find peace and souls are calm, a place of rest like healing balm. Five times a day, the call is made, in this serene and sacred shade.'
            },
            {
                order: 2,
                text: 'Near the hostels I am placed, a peaceful and a holy space. Students come to pray and find, a moment of peace of mind.'
            }
        ],
        hint: '📍 Look for the place of prayer.',
        completionMessage: ' You\'ve found the Peaceful Sanctuary. A place of serenity in the middle of campus life. May you always find peace here.',
        completionIcon: ''
    },
    {
        id: 6,
        title: 'The Hidden Paradise',
        icon: '🌿',
        xp_reward: 250,
        location_id: 'lalazar-park',
        category: 'hidden',
        is_active: true,
        is_disclosed: false,
        answer: 'Lalazar Park',
        clues: [
            {
                order: 1,
                text: 'A secret garden, lush and green, the most beautiful spot you\'ve ever seen. Students come to rest and play, and escape the stress of the day.'
            },
            {
                order: 2,
                text: 'Behind the library I hide, a peaceful spot where you can confide. My beauty is known to only few, a hidden gem for me and you.'
            },
            {
                order: 3,
                text: 'Follow the path behind the trees, where flowers bloom and gentle breeze. This is the place of love and art, a secret garden of the heart.'
            }
        ],
        hint: '📍 Look for the garden behind the library.',
        completionMessage: ' You\'ve discovered the Hidden Paradise! A true gem on campus. This is your place to escape and find peace.',
        completionIcon: ''
    },
    {
        id: 7,
        title: 'The Stage of Dreams',
        icon: '🎭',
        xp_reward: 160,
        location_id: 'main-auditorium',
        category: 'academic',
        is_active: true,
        is_disclosed: false,
        answer: 'Main Auditorium',
        clues: [
            {
                order: 1,
                text: 'Where dramas unfold and speeches are made, and talent on the stage is displayed. The spotlight shines on those who dare, to perform for all who are there.'
            },
            {
                order: 2,
                text: 'Near the main gate I proudly stand, with a stage that is truly grand. Events and gatherings fill my hall, the biggest venue of them all.'
            }
        ],
        hint: '📍 Look for the largest hall on campus.',
        completionMessage: ' The Stage of Dreams awaits! You\'ve found where campus talent shines. Will you be the next star on this stage?',
        completionIcon: ''
    },
    {
        id: 8,
        title: 'The Administrative Fortress',
        icon: '🏛️',
        xp_reward: 130,
        location_id: 'admin-office',
        category: 'essential',
        is_active: true,
        is_disclosed: false,
        answer: 'Admin Office',
        clues: [
            {
                order: 1,
                text: 'Where forms are signed and rules are made, and campus matters are all swayed. The leaders sit in offices high, making decisions that apply.'
            },
            {
                order: 2,
                text: 'In the heart of campus I am found, where admin work does all around. Important letters and official things, this building is where the power springs.'
            }
        ],
        hint: '📍 Look for the administrative building.',
        completionMessage: 'You\'ve conquered the Administrative Fortress! Now you know where to go when official business calls.',
        completionIcon: ''
    },
    {
        id: 9,
        title: ' The Field of Glory',
        icon: '⚽',
        xp_reward: 140,
        location_id: 'football-ground',
        category: 'sports',
        is_active: true,
        is_disclosed: false,
        answer: 'Football Ground',
        clues: [
            {
                order: 1,
                text: 'Where the ball is kicked and goals are scored, and victory is always adored. The grass is green, the nets are set, the greatest game you\'ll ever get.'
            },
            {
                order: 2,
                text: 'Beside the sports complex I lie, where players run and fans all cry. My goalposts stand tall and wide, a football lover\'s dream inside.'
            }
        ],
        hint: '📍 Look for the football pitch.',
        completionMessage: ' Goal! You\'ve found the Field of Glory. Time to show off your skills on the pitch!',
        completionIcon: ''
    },
    {
        id: 10,
        title: 'The chai spot',
        icon: '🫖',
        xp_reward: 90,
        location_id: 'ssc',
        category: 'food',
        is_active: true,
        is_disclosed: false,
        answer: 'SSC',
        clues: [
            {
                order: 1,
                text: 'tea so good the girls are not allowed there'
            },
            {
                order: 2,
                text: 'Near the hostels and the dorms, this place has taken many forms. The cheapest food on campus ground, where boys always can be found.'
            }
        ],
        hint: '📍 near boys hostel',
        completionMessage: 'Sorry girls this kind of tea is only accessible for the boys',
        completionIcon: ''
    }
];

// ========================================
// HELPERS
// ========================================

export function getQuestByLocation(locationId) {
    return questsData.find(q => q.location_id === locationId);
}

export function getActiveQuests() {
    return questsData.filter(q => q.is_active);
}

export function getQuestClues(questId, discoveredLocations) {
    const quest = questsData.find(q => q.id === questId);
    if (!quest) return [];
    if (quest.is_disclosed) return quest.clues;
    const count = discoveredLocations.length;
    const maxClues = Math.min(count, quest.clues.length);
    return quest.clues.slice(0, maxClues);
}

export function shouldDiscloseQuest(quest, discoveredLocations) {
    return discoveredLocations.length >= 2;
}