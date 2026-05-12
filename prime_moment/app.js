// Game State
const state = {
    players: {},
    round: 1,
    currentStop: 0,
    meter: 50,
    timerInterval: null,
    timeRemaining: 300,
    deckIndex: 0,
    currentCustomer: null
};

// Player order matches dice roller turn
const counters = ['Gold', 'Diamond', 'Precious Stones', 'Silver', 'Platinum', 'Polki'];
const cardTypes = ['Expansion Card', 'Assist Card', 'Recommendation Card', 'The Specialist Card'];

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const boardGrid = document.getElementById('board-grid');

// Initialize Game
document.getElementById('start-game-btn').addEventListener('click', () => {
    let allFilled = true;
    counters.forEach(c => {
        const val = document.getElementById('name-' + c).value.trim() || `Player ${c}`;
        state.players[c] = {
            name: val,
            cos: 0,
            cards: [],
            deals: 0
        };
    });
    
    // Give initial 4 cards
    counters.forEach(c => {
        for(let i=0; i<4; i++) {
            state.players[c].cards.push(cardTypes[Math.floor(Math.random()*cardTypes.length)]);
        }
    });

    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    renderBoard();
    updateScoreboard();
    setupNextRound();
});

function renderBoard() {
    boardGrid.innerHTML = '';
    boardStops.forEach((stop, i) => {
        const div = document.createElement('div');
        div.className = `stop-item ${i+1 === state.currentStop ? 'active' : ''}`;
        div.id = `stop-${stop.stop}`;
        div.innerHTML = `
            <div class="stop-num">${stop.stop}</div>
            <div class="stop-info">
                <strong>${stop.lead} Leads</strong><br>
                <span>${stop.required.join(', ')}</span>
            </div>
        `;
        boardGrid.appendChild(div);
    });
}

function updateBoardHighlight() {
    document.querySelectorAll('.stop-item').forEach(el => el.classList.remove('active'));
    if(state.currentStop > 0) {
        document.getElementById(`stop-${state.currentStop}`).classList.add('active');
        document.getElementById(`stop-${state.currentStop}`).scrollIntoView({behavior: "smooth", block: "center"});
    }
}

function setupNextRound() {
    if(state.round > 10) {
        endGame();
        return;
    }
    
    document.getElementById('round-indicator').innerText = `Round ${state.round} / 10`;
    
    // Reset UI
    document.getElementById('customer-card').classList.add('hidden');
    document.getElementById('timer-section').classList.add('hidden');
    document.getElementById('negotiation-section').classList.add('hidden');
    document.getElementById('action-controls').classList.remove('hidden');
    document.getElementById('roll-btn').disabled = false;
    
    // Determine Roller
    if(state.round === 10) {
        document.getElementById('roller-info').innerText = "Grand Round - No Dice Roll";
        document.getElementById('roll-btn').innerText = "Start Grand Round";
    } else {
        const roller = counters[(state.round - 1) % 6];
        document.getElementById('roller-info').innerText = `${roller} (${state.players[roller].name}) to roll`;
        document.getElementById('roll-btn').innerText = "Roll Dice";
    }
}

document.getElementById('roll-btn').addEventListener('click', () => {
    document.getElementById('roll-btn').disabled = true;
    
    if(state.round === 10) {
        state.currentStop = 15;
        updateBoardHighlight();
        revealCustomer();
        return;
    }
    
    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    
    setTimeout(() => {
        dice.classList.remove('rolling');
        const roll = Math.floor(Math.random() * 6) + 1;
        dice.innerText = roll;
        
        // Move token
        state.currentStop += roll;
        if(state.currentStop > 15) state.currentStop = state.currentStop - 15;
        
        updateBoardHighlight();
        revealCustomer();
        
    }, 1000);
});

function revealCustomer() {
    document.getElementById('action-controls').classList.add('hidden');
    const cc = document.getElementById('customer-card');
    cc.classList.remove('hidden');
    
    const stopData = boardStops.find(s => s.stop === state.currentStop);
    let card;
    if(state.round === 10) {
        card = {
            who: "The Biggest Customer of the Season",
            mood: "Extremely demanding, high value",
            cos: 250,
            chance: "All-in-one package deal (+50 COS)"
        };
    } else {
        card = customerDeck[state.deckIndex];
        state.deckIndex++;
    }
    state.currentCustomer = card;
    
    let lead = state.round === 10 ? getHighestScorer() : stopData.lead;
    let reqs = state.round === 10 ? counters : stopData.required;
    
    document.getElementById('cc-who').innerText = card.who;
    document.getElementById('cc-mood').innerText = card.mood;
    document.getElementById('cc-counters').innerText = reqs.join(', ');
    document.getElementById('cc-lead').innerText = lead;
    document.getElementById('cc-cos').innerText = card.cos;
    document.getElementById('cc-chance').innerText = "Hidden Chance: " + card.chance;
    
    document.getElementById('timer-section').classList.remove('hidden');
    
    // Setup inputs
    const negoInputs = document.getElementById('nego-inputs');
    negoInputs.innerHTML = '';
    reqs.forEach(c => {
        negoInputs.innerHTML += `
            <div class="input-group">
                <label>${c} (${state.players[c].name})</label>
                <input type="number" id="nego-${c}" value="0" min="0">
            </div>
        `;
    });
}

function getHighestScorer() {
    let top = counters[0];
    let max = -1;
    counters.forEach(c => {
        if(state.players[c].cos > max) { max = state.players[c].cos; top = c; }
    });
    return top;
}

document.getElementById('start-timer-btn').addEventListener('click', () => {
    document.getElementById('start-timer-btn').classList.add('hidden');
    document.getElementById('negotiation-section').classList.remove('hidden');
    
    state.timeRemaining = state.round === 10 ? 420 : 300; // 7 mins or 5 mins
    updateTimerDisplay();
    
    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();
        if(state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            handleWalkout();
        }
    }, 1000);
});

function updateTimerDisplay() {
    const min = Math.floor(state.timeRemaining / 60).toString().padStart(2, '0');
    const sec = (state.timeRemaining % 60).toString().padStart(2, '0');
    const el = document.getElementById('timer');
    el.innerText = `${min}:${sec}`;
    if(state.timeRemaining <= 60) el.classList.add('warning');
    else el.classList.remove('warning');
}

function handleWalkout() {
    clearInterval(state.timerInterval);
    alert("Time's up! The customer walked out.");
    updateMeter(-20); // Penalty
    endRound();
}

document.getElementById('walkout-btn').addEventListener('click', () => {
    if(confirm('Are you sure the customer walked out?')) {
        clearInterval(state.timerInterval);
        updateMeter(-20);
        endRound();
    }
});

document.getElementById('agree-btn').addEventListener('click', () => {
    clearInterval(state.timerInterval);
    
    const stopData = boardStops.find(s => s.stop === state.currentStop);
    const reqs = state.round === 10 ? counters : stopData.required;
    
    let totalAssigned = 0;
    reqs.forEach(c => {
        const val = parseInt(document.getElementById(`nego-${c}`).value) || 0;
        state.players[c].cos += val;
        state.players[c].deals++;
        totalAssigned += val;
    });
    
    // Apply bonuses
    let meterBonus = 0;
    if(state.meter >= 81) meterBonus = 5;
    
    let timeBonus = 0;
    if((state.round === 10 && state.timeRemaining > 300) || (state.round !== 10 && state.timeRemaining > 180)) {
        timeBonus = 10; // Fast agreement
    }
    
    let grandBonus = state.round === 10 ? 20 : 0;
    
    reqs.forEach(c => {
        state.players[c].cos += meterBonus + grandBonus;
        if(c === stopData.lead) state.players[c].cos += timeBonus;
    });
    
    updateMeter(10);
    endRound();
});

function updateMeter(change) {
    state.meter += change;
    if(state.meter > 100) state.meter = 100;
    if(state.meter < 0) state.meter = 0;
    
    const fill = document.getElementById('meter-fill');
    fill.style.width = state.meter + '%';
    
    let status = "Good";
    if(state.meter >= 81) status = "Excellent";
    else if(state.meter <= 25) status = "Very Bad";
    else if(state.meter <= 50) status = "Weak";
    
    document.getElementById('meter-text').innerText = `${state.meter} / 100 - ${status}`;
    
    // Gradient update
    if(status === "Very Bad") fill.style.background = "var(--red)";
    else if(status === "Weak") fill.style.background = "#f59e0b";
    else fill.style.background = "linear-gradient(90deg, var(--red) 0%, var(--gold) 50%, var(--green) 100%)";
}

function updateScoreboard() {
    const tbody = document.querySelector('#score-table tbody');
    tbody.innerHTML = '';
    
    // Sort
    const sorted = counters.slice().sort((a,b) => state.players[b].cos - state.players[a].cos);
    
    sorted.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c}</td>
                <td>${state.players[c].name}</td>
                <td><strong>${state.players[c].cos}</strong></td>
            </tr>
        `;
    });
}

function endRound() {
    updateScoreboard();
    state.round++;
    
    // Give new card every 2 rounds
    if(state.round % 2 === 1 && state.round < 10) {
        counters.forEach(c => {
            state.players[c].cards.push(cardTypes[Math.floor(Math.random()*cardTypes.length)]);
        });
    }
    
    // Pre round 10 +1 card
    if(state.round === 10) {
        counters.forEach(c => {
            state.players[c].cards.push(cardTypes[Math.floor(Math.random()*cardTypes.length)]);
        });
    }
    
    setupNextRound();
}

function endGame() {
    document.querySelector('.dashboard').innerHTML = `
        <div class="panel" style="grid-column: 1 / -1; text-align: center; justify-content: center; height: 100%;">
            <h1 style="font-size: 4rem; margin-bottom: 2rem;">Game Over</h1>
            <h2>Top Customer Owner: ${getHighestScorer()} (${state.players[getHighestScorer()].name})</h2>
            <p style="margin-top: 1rem; font-size: 1.5rem;">Total Score: ${state.players[getHighestScorer()].cos} COS</p>
            <button class="gold-btn" style="margin-top: 2rem; font-size: 1.2rem; padding: 1rem 2rem;" onclick="location.reload()">Play Again</button>
        </div>
    `;
}

// Host Card Manager
document.getElementById('generate-cards-btn').addEventListener('click', () => {
    const display = document.getElementById('host-cards-display');
    display.classList.toggle('hidden');
    if(!display.classList.contains('hidden')) {
        let text = "--- COPY PASTE TO PLAYERS IN ZOOM ---\n\n";
        counters.forEach(c => {
            text += `[${state.players[c].name} - ${c} Counter]\n`;
            state.players[c].cards.forEach(card => text += `- ${card}\n`);
            text += `\n`;
        });
        display.innerHTML = `<pre>${text}</pre>`;
    }
});
