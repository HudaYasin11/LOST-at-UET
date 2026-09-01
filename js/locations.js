const locations = [
    // =========================
    // ACADEMIC
    // =========================
    {
        id: "cs-department",
        name: "CS Department",
        category: "academic",
        description: "The home of UET Computer Science students.",
        landmark: "Academic area",
        tip: "Your journey as a CS student begins here.",
        xp: 100,
        isHidden: false
    },
    {
        id: "lecture-theatre",
        name: "Lecture Theatre (LT)",
        category: "academic",
        description: "A major lecture space used for classes and academic activities.",
        landmark: "Academic area",
        tip: "Make sure you know which lecture theatre your class is in.",
        xp: 75,
        isHidden: false
    },
    {
        id: "national-library",
        name: "National Library",
        category: "academic",
        description: "A major place for studying and academic resources.",
        landmark: "Main campus",
        tip: "A useful place to know before exam season arrives.",
        xp: 100,
        isHidden: false
    },
    {
        id: "computer-engineering-department",
        name: "Computer Engineering Department",
        category: "academic",
        description: "The department focused on computer engineering studies.",
        landmark: "Academic area",
        tip: "Another important department to explore.",
        xp: 75,
        isHidden: false
    },
    {
        id: "electrical-engineering-department",
        name: "Electrical Engineering Department",
        category: "academic",
        description: "One of the major engineering departments on campus.",
        landmark: "Academic area",
        tip: "Explore beyond your own department.",
        xp: 75,
        isHidden: false
    },
    {
        id: "chemical-engineering-department",
        name: "Chemical Engineering Department",
        category: "academic",
        description: "The department dedicated to chemical engineering.",
        landmark: "Academic area",
        tip: "Another checkpoint on your campus journey.",
        xp: 75,
        isHidden: false
    },
    {
        id: "architecture-department",
        name: "Architecture Department",
        category: "academic",
        description: "The department for architecture students and studies.",
        landmark: "Academic area",
        tip: "Discover another creative side of UET.",
        xp: 75,
        isHidden: false
    },
    {
        id: "architectural-engineering-department",
        name: "Architectural Engineering Department",
        category: "academic",
        description: "An academic department focused on architectural engineering.",
        landmark: "Academic area",
        tip: "Another location added to your exploration map.",
        xp: 75,
        isHidden: false
    },
    {
        id: "mathematics-department",
        name: "Mathematics Department",
        category: "academic",
        description: "The academic department dedicated to mathematics.",
        landmark: "Academic area",
        tip: "You may visit this place more often than you expect.",
        xp: 75,
        isHidden: false
    },
    {
        id: "islamic-studies-department",
        name: "Islamic Studies Department",
        category: "academic",
        description: "The department related to Islamic Studies.",
        landmark: "Academic area",
        tip: "Keep exploring every corner of campus.",
        xp: 75,
        isHidden: false
    },
    {
        id: "humanities-department",
        name: "Humanities Department",
        category: "academic",
        description: "An academic department focused on humanities.",
        landmark: "Academic area",
        tip: "Campus exploration is not just about your own field.",
        xp: 75,
        isHidden: false
    },
    {
        id: "mechatronics-department",
        name: "Mechatronics Department",
        category: "academic",
        description: "The department focused on mechatronics engineering.",
        landmark: "Academic area",
        tip: "Another engineering checkpoint unlocked.",
        xp: 75,
        isHidden: false
    },
    {
        id: "computing-block",
        name: "Computing Block",
        category: "academic",
        description: "A major block associated with computing and technology studies.",
        landmark: "Academic area",
        tip: "A useful landmark for navigating the campus.",
        xp: 75,
        isHidden: false
    },
    {
        id: "main-block",
        name: "Main Block",
        category: "academic",
        description: "One of the central and important buildings on campus.",
        landmark: "Main campus",
        tip: "Knowing the Main Block helps you navigate the campus.",
        xp: 100,
        isHidden: false
    },
    {
        id: "civil-engineering-department",
        name: "Civil Engineering Department",
        category: "academic",
        description: "The department dedicated to civil engineering studies.",
        landmark: "Academic area",
        tip: "Another major department discovered.",
        xp: 75,
        isHidden: false
    },
    {
        id: "ids-department",
        name: "IDS Department",
        category: "academic",
        description: "An academic department and campus location.",
        landmark: "Academic area",
        tip: "Keep expanding your campus knowledge.",
        xp: 75,
        isHidden: false
    },
    {
        id: "automotive-department",
        name: "Automotive Department",
        category: "academic",
        description: "The department focused on automotive studies and engineering.",
        landmark: "Academic area",
        tip: "Another part of UET explored.",
        xp: 75,
        isHidden: false
    },

    // =========================
    // FOOD
    // =========================
    {
        id: "gssc",
        name: "GSSC",
        category: "food",
        description: "A popular campus food spot.",
        landmark: "Campus",
        tip: "A useful place to know when hunger strikes.",
        xp: 75,
        isHidden: false
    },
    {
        id: "ssc",
        name: "SSC",
        category: "food",
        description: "A campus food and student hangout spot.",
        landmark: "Campus",
        tip: "A familiar stop for many students.",
        xp: 75,
        isHidden: false
    },
    {
        id: "annex",
        name: "Annex",
        category: "food",
        description: "A place to grab food and take a break.",
        landmark: "Campus",
        tip: "Every explorer needs energy.",
        xp: 75,
        isHidden: false
    },
    {
        id: "bhola-cafe",
        name: "Bhola Cafe",
        category: "food",
        description: "A campus cafe and food spot.",
        landmark: "Campus",
        tip: "Another food stop added to your map.",
        xp: 75,
        isHidden: false
    },
    {
        id: "syalani-cafe",
        name: "Syalani Cafe",
        category: "food",
        description: "A campus cafe worth discovering.",
        landmark: "Campus",
        tip: "Exploration is better when you know where the food is.",
        xp: 75,
        isHidden: false
    },
    {
        id: "que-cafe",
        name: "Que Cafe",
        category: "food",
        description: "A popular campus food spot for boys.",
        landmark: "Campus",
        tip: "Another food location discovered.",
        xp: 75,
        isHidden: false
    },

    // =========================
    // SPORTS
    // =========================
    {
        id: "jj-stadium",
        name: "JJ Stadium",
        category: "sports",
        description: "A major sports and activity location on campus.",
        landmark: "Sports area",
        tip: "There is more to university than assignments.",
        xp: 100,
        isHidden: false
    },
    {
        id: "sports-complex",
        name: "Sports Complex",
        category: "sports",
        description: "A campus space for sports and physical activities.",
        landmark: "Sports area",
        tip: "Take some time away from the screen.",
        xp: 100,
        isHidden: false
    },
    {
        id: "football-ground",
        name: "Football Ground",
        category: "sports",
        description: "The campus football ground.",
        landmark: "Sports area",
        tip: "A major spot for sports lovers.",
        xp: 75,
        isHidden: false
    },
    {
        id: "badminton-court",
        name: "Badminton Court",
        category: "sports",
        description: "A campus space for badminton and sports activities.",
        landmark: "Sports area",
        tip: "Another sports checkpoint discovered.",
        xp: 75,
        isHidden: false
    },
    {
        id: "swimming-pool",
        name: "Swimming Pool",
        category: "sports",
        description: "The campus swimming facility.",
        landmark: "Sports area",
        tip: "Not every student discovers this place immediately.",
        xp: 100,
        isHidden: false
    },
    {
        id: "gym",
        name: "Gym",
        category: "sports",
        description: "A campus fitness and workout space.",
        landmark: "Sports area",
        tip: "For explorers who also train.",
        xp: 75,
        isHidden: false
    },

    // =========================
    // SERVICES & IMPORTANT PLACES
    // =========================
    {
        id: "main-auditorium",
        name: "Main Auditorium",
        category: "landmark",
        description: "A major venue for university events and gatherings.",
        landmark: "Main campus",
        tip: "You will probably attend an event here eventually.",
        xp: 100,
        isHidden: false
    },
    {
        id: "mosque",
        name: "Mosque",
        category: "essential",
        description: "An important place for students and staff on campus.",
        landmark: "Campus",
        tip: "A key campus landmark to know.",
        xp: 75,
        isHidden: false
    },
    {
        id: "admin-office",
        name: "Admin Office",
        category: "services",
        description: "An important administrative location on campus.",
        landmark: "Main campus",
        tip: "Useful to know when official work appears.",
        xp: 75,
        isHidden: false
    },
    {
        id: "bank",
        name: "Bank",
        category: "services",
        description: "A banking facility available on or around campus.",
        landmark: "Campus",
        tip: "A useful essential location.",
        xp: 75,
        isHidden: false
    },
    {
        id: "transport-department",
        name: "Transport Department",
        category: "services",
        description: "The department related to university transport services.",
        landmark: "Campus",
        tip: "A useful place to know for transport-related matters.",
        xp: 75,
        isHidden: false
    },
    {
        id: "post-office",
        name: "Post Office",
        category: "services",
        description: "A campus postal service location.",
        landmark: "Campus",
        tip: "A surprisingly useful place to know.",
        xp: 75,
        isHidden: false
    },
    {
        id: "security-office",
        name: "Security Office",
        category: "services",
        description: "The campus security office.",
        landmark: "Campus",
        tip: "An important campus service location.",
        xp: 75,
        isHidden: false
    },
    {
        id: "shopping-market",
        name: "Shopping Market",
        category: "services",
        description: "A place for shopping and everyday needs.",
        landmark: "Campus",
        tip: "Useful when you need something quickly.",
        xp: 75,
        isHidden: false
    },

    // =========================
    // STUDENT LIFE & EXPLORE
    // =========================
    {
        id: "lalazar-park",
        name: "Lalazar Park",
        category: "explore",
        description: "A scenic campus spot known as the Garden of Love.",
        landmark: "Campus",
        tip: "Take a break and enjoy one of the calmer sides of campus.",
        xp: 150,
        isHidden: false
    },
    {
        id: "fries-hidden-spot",
        name: "Fries Hidden Spot",
        category: "hidden",
        description: "A hidden campus spot known by students.",
        landmark: "Secret location",
        tip: "Some discoveries are meant for true explorers.",
        xp: 150,
        isHidden: true
    },
    {
        id: "new-girls-hostel",
        name: "New Girls Hostel",
        category: "student-life",
        description: "A major student accommodation location.",
        landmark: "Campus",
        tip: "An important campus landmark.",
        xp: 75,
        isHidden: false
    },
    {
        id: "ayesha-hall",
        name: "Ayesha Hall",
        category: "student-life",
        description: "A notable student facility and campus location.",
        landmark: "Campus",
        tip: "Another important place added to your discoveries.",
        xp: 75,
        isHidden: false
    },
    {
        id: "staff-club",
        name: "Staff Club",
        category: "student-life",
        description: "A notable campus facility.",
        landmark: "Campus",
        tip: "Keep exploring beyond the usual student routes.",
        xp: 75,
        isHidden: false
    }
];