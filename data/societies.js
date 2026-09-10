import { societyDetails } from './society-details.js';

export const UET_SOURCE = 'https://www.uet.edu.pk/facilties/core-facilities/societies-clubs/';

// Names follow UET's 2025–2026 directory. Categories are editorial browsing aids.
// Approved accounts and local profile images are merged from society-details.js.
const entries = [
    ['ashrae','ASHRAE, UET Lahore Student Branch','ASHRAE','Engineering'],
    ['spe','Society of Petroleum Engineers, UET Lahore Chapter','SPE','Engineering'],
    ['sae','Society of Automotive Engineering','SAE','Engineering'],
    ['spet','Society of Polymer Engineers and Technologies (SPET)','SPET','Engineering'],
    ['spid','Society of Product and Industrial Designers (SPID)','SPID','Design & arts'],
    ['usra','UET CRP Society (USRA)','USRA','Engineering'],
    ['science','UET Science Society','USS','Science & technology'],
    ['ehs','UET Environmental and Horticulture Society (EHS)','EHS','Environment'],
    ['gym','Green Youth Movement (GYM) Club UET','GYM','Environment'],
    ['itf','ITF; UET Student Chapter','ITF','Engineering'],
    ['mechatronics','Mechatronics Club','MC','Engineering'],
    ['cbs','Character Building Society (CBS)','CBS','Community'],
    ['justuju','Justuju','J','Community'],
    ['blood-donors','UET Blood Donors Society','BDS','Community'],
    ['aed','AED Student Chapter','AED','Design & arts'],
    ['uraan','Uraan','U','Community'],
    ['gdg','Google Development Group UET Lahore','GDG','Computing & cloud'],
    ['literary','UET Literary Society','ULS','Literature & speaking'],
    ['zimal','Zimal UET (Girls) Society','Z','Community'],
    ['some','Society of Mining Engineers (SoME)','SoME','Engineering'],
    ['chemical','Ibne Hayyan Chemical Society','IHCS','Science & technology'],
    ['mun','UET MUN Society','MUN','Literature & speaking'],
    ['iet','IET Student Chapter','IET','Engineering'],
    ['ieee','IEEE Students Chapter','IEEE','Engineering'],
    ['imec','IMEC','IMEC','Engineering'],
    ['climate','Climate Action Forum','CAF','Environment'],
    ['debating','UET Debating Society','UDS','Literature & speaking'],
    ['ice','ICE Student Chapter','ICE','Engineering'],
    ['asme','ASME Student Chapter','ASME','Engineering'],
    ['dramatics','UET Dramatics Society','DRA','Design & arts'],
    ['mechanical','Institute of Mechanical Engineers, UET Lahore Chapter','IMechE','Engineering'],
    ['acm','ACM Student Chapter','ACM','Computing & cloud'],
    ['music','UET Music Society','MUS','Music'],
    ['islamic','Islamic Society','IS','Community'],
    ['media','UET Media Society','UMS','Media & journalism'],
    ['x-news','UET X-News','X','Media & journalism'],
    ['aks','UET AKS','AKS','Media & journalism'],
    ['tribune','UET Tribune','UT','Media & journalism'],
    ['physica','Physica Society','PHY','Science & technology'],
    ['inquisitors','Inquisitors Society','INQ','Community'],
    ['formula-student','Formula Student UET Lahore','FS','Engineering']
];

export const societies = entries.map(([id,name,initials,category]) => ({
    id,name,initials,category,logo:null,instagram:null,links:[],
    source:UET_SOURCE,sourceLabel:'UET listing',
    status:'Listed by UET · 2025–2026',description:null
}));

Object.assign(societies.find(society => society.id === 'music'), {
    description:'A space for vocalists, instrumentalists, and music lovers, with concerts, jam sessions, and competitions.',
    links:[{label:'LinkedIn',url:'https://www.linkedin.com/company/uet-music-society/'}],
    descriptionSource:'https://www.linkedin.com/company/uet-music-society/'
});

societies.push({
    id:'aws',name:'AWS Student Builder Group — UET Lahore',initials:'AWS',
    category:'Computing & cloud',logo:null,
    instagram:'https://www.instagram.com/aws_sbg_uet/',
    instagramSource:'User-confirmed account, 2026-09-10',
    description:'Learn about cloud computing and AWS through technical sessions and practical projects.',
    source:'https://www.meetup.com/aws-sbg-at-uet-lahore-main/',sourceLabel:'Meetup',
    status:'Student community · UET registration unconfirmed',
    links:[]
});

for (const society of societies) {
    Object.assign(society, societyDetails[society.id] || {});
    // AWS already uses Meetup as its source link.
    society.links = society.links.filter(link => link.url !== society.source);
}

export function findSocieties(query = '', category = 'all') {
    const normalized = query.trim().toLocaleLowerCase();
    const priority = { music: 0, aws: 1 };
    return societies.filter(society =>
        (category === 'all' || society.category === category) &&
        `${society.name} ${society.initials} ${society.category} ${society.description || ''}`.toLocaleLowerCase().includes(normalized)
    ).sort((a, b) => (priority[a.id] ?? 2) - (priority[b.id] ?? 2));
}
