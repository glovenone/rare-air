// Editorial rarity: 1 = familiar, 2 = uncommon, 3 = rare, 4 = exceptionally rare.
const make=(id,category,prompt,entries)=>({id,category,prompt,answers:entries.split('|').map(s=>{const [names,tier]=s.split(':');const [label,...aliases]=names.split('/');return {label,aliases,tier:Number(tier)}})});
export const questions=[
make('planets','SPACE','Name a planet in our solar system.','Earth:1|Mars:1|Jupiter:1|Saturn:2|Venus:2|Mercury:3|Neptune:3|Uranus:4'),
make('noble-gases','SCIENCE','Name a noble gas.','Helium/He:1|Neon/Ne:1|Argon/Ar:2|Krypton/Kr:3|Xenon/Xe:3|Radon/Rn:4|Oganesson/Og:4'),
make('chess','GAMES','Name a type of chess piece.','King:1|Queen:1|Pawn:2|Knight/Horse:2|Rook/Castle:3|Bishop:4'),
make('greek','LANGUAGE','Name a letter of the Greek alphabet.','Alpha:1|Beta:1|Gamma:1|Delta:1|Epsilon:2|Zeta:2|Eta:3|Theta:2|Iota:3|Kappa:2|Lambda:2|Mu:3|Nu:4|Xi:4|Omicron:2|Pi:1|Rho:3|Sigma:1|Tau:3|Upsilon:4|Phi:2|Chi:3|Psi:3|Omega:1'),
make('months','EVERYDAY','Name a month with exactly 30 days.','April:1|June:2|September:3|November:4'),
make('zodiac','CULTURE','Name one of the 12 Western zodiac signs.','Aries:1|Taurus:2|Gemini:1|Cancer:2|Leo:1|Virgo:2|Libra:2|Scorpio/Scorpius:1|Sagittarius:3|Capricorn:3|Aquarius:3|Pisces:4'),
make('strings','MUSIC','Name a standard instrument in an orchestral string section.','Violin:1|Cello/Violoncello:2|Viola:3|Double bass/Contrabass/String bass/Upright bass:4'),
make('oceans','GEOGRAPHY','Name one of Earth’s five oceans.','Pacific/Pacific Ocean:1|Atlantic/Atlantic Ocean:1|Indian/Indian Ocean:2|Arctic/Arctic Ocean:3|Southern/Southern Ocean/Antarctic/Antarctic Ocean:4'),
make('dwarfs','SPACE','Name a dwarf planet recognized by the IAU.','Pluto:1|Ceres:2|Eris:3|Haumea:4|Makemake:4'),
make('si','SCIENCE','Name an SI base unit (not a prefix).','Metre/Meter/m:1|Kilogram/kg:1|Second/s:1|Ampere/Amp/A:2|Kelvin/K:2|Mole/mol:3|Candela/cd:4'),
make('nordic','GEOGRAPHY','Name a sovereign Nordic country.','Sweden:1|Norway:1|Denmark:2|Finland:3|Iceland:4'),
make('great-lakes','GEOGRAPHY','Name one of the five North American Great Lakes.','Michigan/Lake Michigan:1|Superior/Lake Superior:1|Erie/Lake Erie:2|Ontario/Lake Ontario:3|Huron/Lake Huron:4'),
make('rainbow','NATURE','Name one of the traditional seven rainbow colors.','Red:1|Orange:2|Yellow:1|Green:1|Blue:1|Indigo:4|Violet:3'),
make('disney','MOVIES','Name one of the seven dwarfs in Disney’s 1937 Snow White.','Dopey:1|Grumpy:1|Happy:2|Sleepy:2|Doc:3|Sneezy:3|Bashful:4'),
make('bonds','MOVIES','Name an actor who played James Bond in an Eon-produced film.','Daniel Craig/Craig:1|Sean Connery/Connery:1|Pierce Brosnan/Brosnan:2|Roger Moore/Moore:2|Timothy Dalton/Dalton:3|George Lazenby/Lazenby:4'),
make('tennis','SPORT','Name one of the four tennis Grand Slam tournaments.','Wimbledon:1|US Open/U.S. Open:2|Australian Open:3|French Open/Roland Garros:4'),
make('roman','LANGUAGE','Name a letter used as a standard Roman numeral.','I:1|V:1|X:1|L:3|C:2|D:4|M:2'),
make('g7','GEOGRAPHY','Name a G7 member country.','United States/USA/US/United States of America/America:1|United Kingdom/UK/Britain/Great Britain:1|Canada:2|France:2|Germany:2|Japan:3|Italy:4'),
make('mercury','SCIENCE','Name an element whose chemical symbol is a single letter.','Hydrogen/H:1|Boron/B:3|Carbon/C:1|Nitrogen/N:2|Oxygen/O:1|Fluorine/F:3|Phosphorus/P:3|Sulfur/Sulphur/S:2|Potassium/K:3|Vanadium/V:4|Yttrium/Y:4|Iodine/I:3|Tungsten/W:4|Uranium/U:2'),
make('us-states-a','GEOGRAPHY','Name a US state starting with the letter A.','Alabama:1|Alaska:2|Arizona:2|Arkansas:4'),
make('senses','EVERYDAY','Name one of the traditional five human senses.','Sight/Vision/Seeing:1|Hearing/Sound:1|Taste:2|Smell:2|Touch/Feeling:4'),
make('bronte','BOOKS','Name a Brontë sister who published a novel.','Charlotte/Charlotte Bronte/Charlotte Brontë:1|Emily/Emily Bronte/Emily Brontë:2|Anne/Anne Bronte/Anne Brontë:4'),
make('continents','GEOGRAPHY','Name a continent in the seven-continent model.','Asia:1|Africa:1|Europe:1|North America:2|South America:2|Antarctica:3|Australia:4'),
make('solids','MATH','Name a Platonic solid.','Cube/Hexahedron:1|Tetrahedron:2|Octahedron:3|Dodecahedron:3|Icosahedron:4'),
make('cards','GAMES','Name a suit in a standard French-suited deck of cards.','Hearts/Heart:1|Spades/Spade:1|Diamonds/Diamond:2|Clubs/Club:4'),
make('musical-notes','MUSIC','Name a letter used for a natural musical note in English notation.','C:1|A:1|G:2|D:2|E:2|F:3|B:4'),
make('us-states-n','GEOGRAPHY','Name a US state starting with the letter N.','New York:1|New Jersey:1|Nevada:2|North Carolina:2|New Mexico:3|Nebraska:3|New Hampshire:4|North Dakota:4'),
make('mars-moons','SPACE','Name a moon of Mars.','Phobos:2|Deimos:4'),
make('ninja-turtles','CULTURE','Name one of the four Teenage Mutant Ninja Turtles.','Leonardo/Leo:1|Michelangelo/Mikey:1|Raphael/Raph:2|Donatello/Donnie/Don:4'),
make('track','SPORT','Name an event in the men’s Olympic decathlon.','100 metres/100 meters/100m:1|Long jump:1|Shot put/Shotput:2|High jump:1|400 metres/400 meters/400m:2|110 metres hurdles/110 meters hurdles/110m hurdles/110 hurdles:3|Discus throw/Discus:3|Pole vault:2|Javelin throw/Javelin:3|1500 metres/1500 meters/1500m:4')
];
export const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function evaluate(question,input){const n=normalize(input);const a=question.answers.find(a=>[a.label,...a.aliases].some(x=>normalize(x)===n));return a?{correct:true,label:a.label,tier:a.tier,points:[0,100,250,500,1000][a.tier]}:{correct:false,label:input,tier:0,points:0};}
export function schedule(key){let seed=2166136261;for(const c of 'rare-v1:'+key)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;const pool=[...questions];for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,5);}
export const publicQuestion=q=>({id:q.id,category:q.category,prompt:q.prompt});
