const countersList = ['Gold', 'Diamond', 'Precious Stones', 'Silver', 'Platinum', 'Polki'];

const boardStops = [
    { stop: 1, required: ['Gold', 'Diamond', 'Silver', 'Polki'], lead: 'Gold', text: 'Gold, Diamond, Silver and Polki come together' },
    { stop: 2, required: ['Gold', 'Precious Stones', 'Silver'], lead: 'Precious Stones', text: 'Gold, Precious Stones and Silver serve together' },
    { stop: 3, required: ['Diamond', 'Silver', 'Platinum'], lead: 'Diamond', text: 'Diamond, Silver and Platinum work as a team' },
    { stop: 4, required: ['Gold', 'Precious Stones', 'Silver', 'Platinum'], lead: 'Gold', text: 'Four counters — Gold opens the conversation' },
    { stop: 5, required: ['Diamond', 'Precious Stones', 'Platinum', 'Polki'], lead: 'Diamond', text: 'Diamond leads a four-counter bridal situation' },
    { stop: 6, required: ['Silver', 'Polki', 'Diamond', 'Gold'], lead: 'Silver', text: 'Silver leads — Diamond, Gold join in' },
    { stop: 7, required: ['Gold', 'Diamond', 'Precious Stones'], lead: 'Diamond', text: 'Gold, Diamond and Precious Stones together' },
    { stop: 8, required: ['Gold', 'Diamond', 'Silver', 'Platinum', 'Polki'], lead: 'Gold', text: 'Five counters — a big customer, Gold leads' },
    { stop: 9, required: ['Precious Stones', 'Silver', 'Platinum'], lead: 'Precious Stones', text: 'Precious Stones, Silver and Platinum collaborate' },
    { stop: 10, required: ['Diamond', 'Platinum', 'Polki'], lead: 'Platinum', text: 'Diamond, Platinum and Polki come together' },
    { stop: 11, required: ['Gold', 'Precious Stones', 'Polki'], lead: 'Gold', text: 'Gold, Precious Stones and Polki — a heritage journey' },
    { stop: 12, required: ['Diamond', 'Precious Stones', 'Silver', 'Platinum'], lead: 'Precious Stones', text: 'Four counters, Precious Stones in front' },
    { stop: 13, required: ['Gold', 'Polki', 'Silver', 'Platinum'], lead: 'Polki', text: 'Polki leads — Gold, Silver and Platinum join' },
    { stop: 14, required: ['Gold', 'Diamond', 'Precious Stones', 'Silver'], lead: 'Diamond', text: 'Four counters — Diamond opens negotiations' },
    { stop: 15, required: ['Gold', 'Diamond', 'Precious Stones', 'Silver', 'Platinum', 'Polki'], lead: 'Gold', text: 'The Grand Round — every counter must be present' }
];

const customerTypes = [
    { type: 'Bridal Customer', who: 'Premium Bridal Family', mood: 'Wants only best — budget is not a concern', cos: 150, chance: 'Return gifts for guests (+20 COS)' },
    { type: 'Bridal Customer', who: 'Wedding shopping with family involved', mood: 'Excited but cautious', cos: 120, chance: 'Trousseau packing add-on (+15 COS)' },
    { type: 'VIP Family', who: 'Premium family — wants everything', mood: 'Impatient, expects royal treatment', cos: 180, chance: 'Engagement ring upgrade (+30 COS)' },
    { type: 'Couple Purchase', who: 'Buying for engagement or anniversary', mood: 'Romantic, highly emotional', cos: 80, chance: 'Matching pendants (+15 COS)' },
    { type: 'Festival Shopper', who: 'Buying gifts in bulk for a festival', mood: 'Looking for value and speed', cos: 100, chance: 'Corporate gifting tie-up (+25 COS)' },
    { type: 'NRI Customer', who: 'High spender, decides fast', mood: 'Short on time, highly decisive', cos: 140, chance: 'Heritage piece addition (+30 COS)' },
    { type: 'Loyal Customer', who: 'Regular buyer, wants something special', mood: 'Familiar, wants recognition', cos: 90, chance: 'Custom design request (+20 COS)' },
    { type: 'Traditional Family', who: 'Multi-generation, culture-driven buying', mood: 'Respectful of elders\' opinions', cos: 110, chance: 'Pooja articles bulk (+15 COS)' },
    { type: 'Luxury Bridal Styling', who: 'Wants a complete bridal look', mood: 'Highly particular about aesthetics', cos: 160, chance: 'Groom styling add-on (+30 COS)' },
    { type: 'Corporate Gift Buyer', who: 'Buying in bulk for company gifting', mood: 'Professional, budget-oriented', cos: 130, chance: 'Annual contract (+40 COS)' },
    { type: 'Celebrity Walk-In', who: 'Wants exclusive pieces, high expectations', mood: 'Needs privacy and perfection', cos: 200, chance: 'PR opportunity (+50 COS)' }
];

function generateCustomerCards() {
    let deck = [];
    for(let i=0; i<30; i++) {
        let template = customerTypes[Math.floor(Math.random() * customerTypes.length)];
        deck.push({ ...template, id: i+1 });
    }
    return deck;
}
const customerDeck = generateCustomerCards();
