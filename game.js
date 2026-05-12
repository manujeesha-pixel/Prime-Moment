const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const nodePositions = [
    { id: 0, x: 300, y: 50 },
    { id: 1, x: 216.67, y: 200 }, { id: 2, x: 300, y: 200 }, { id: 3, x: 383.33, y: 200 },
    { id: 4, x: 133.33, y: 350 }, { id: 5, x: 216.67, y: 350 }, { id: 6, x: 300, y: 350 }, { id: 7, x: 383.33, y: 350 }, { id: 8, x: 466.67, y: 350 },
    { id: 9, x: 50, y: 500 }, { id: 10, x: 133.33, y: 500 }, { id: 11, x: 216.67, y: 500 }, { id: 12, x: 300, y: 500 }, { id: 13, x: 383.33, y: 500 }, { id: 14, x: 466.67, y: 500 }, { id: 15, x: 550, y: 500 },
    { id: 16, x: 50, y: 650 }, { id: 17, x: 133.33, y: 650 }, { id: 18, x: 216.67, y: 650 }, { id: 19, x: 300, y: 650 }, { id: 20, x: 383.33, y: 650 }, { id: 21, x: 466.67, y: 650 }, { id: 22, x: 550, y: 650 }
];

const lines = [
    [0, 1, 4, 9], [0, 3, 8, 15], [0, 2, 6, 12, 19],
    [1, 2, 3], [4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15], [16, 17, 18, 19, 20, 21, 22],
    [9, 16], [4, 10, 17], [1, 5, 11, 18], [3, 7, 13, 20], [8, 14, 21], [15, 22],
    [2, 5, 10], [2, 7, 14], [1, 6, 13], [3, 6, 11]
];

const adjacencyList = {};
for (let i = 0; i < 23; i++) adjacencyList[i] = new Set();
lines.forEach(line => {
    for (let i = 0; i < line.length - 1; i++) {
        adjacencyList[line[i]].add(line[i+1]);
        adjacencyList[line[i+1]].add(line[i]);
    }
});
for (let i = 0; i < 23; i++) adjacencyList[i] = Array.from(adjacencyList[i]);

// State
let board = Array(23).fill(null);
let turn = 'G'; // 'G' for Goat, 'T' for Tiger
let phase = 'PLACEMENT';
let goatsPlaced = 0;
let goatsCaptured = 0;
let selectedPiece = null;
let hoveredNode = null;
let isGameOver = false;

// DOM Elements
const turnIndicator = document.getElementById('turnIndicator');
const goatsPlacedCounter = document.getElementById('goatsPlacedCounter');
const goatsCapturedCounter = document.getElementById('goatsCapturedCounter');
const instructionText = document.getElementById('instructionText');
const gameOverModal = document.getElementById('gameOverModal');
const winnerTitle = document.getElementById('winnerTitle');
const restartBtn = document.getElementById('restartBtn');
const modalRestartBtn = document.getElementById('modalRestartBtn');

function initGame() {
    board = Array(23).fill(null);
    board[0] = 'T';
    board[1] = 'T';
    board[3] = 'T';
    
    turn = 'G';
    phase = 'PLACEMENT';
    goatsPlaced = 0;
    goatsCaptured = 0;
    selectedPiece = null;
    isGameOver = false;

    gameOverModal.classList.add('hidden');
    updateUI();
    drawBoard();
}

function updateUI() {
    if (turn === 'G') {
        turnIndicator.textContent = "Goat's Turn";
        turnIndicator.className = 'turn-indicator goat';
        if (phase === 'PLACEMENT') {
            instructionText.textContent = "Place a goat on an empty intersection.";
        } else {
            instructionText.textContent = "Select a goat to move to an adjacent node.";
        }
    } else {
        turnIndicator.textContent = "Tiger's Turn";
        turnIndicator.className = 'turn-indicator tiger';
        instructionText.textContent = "Select a tiger to move or jump a goat.";
    }

    goatsPlacedCounter.textContent = `Goats Placed: ${goatsPlaced}/15`;
    goatsCapturedCounter.textContent = `Captured: ${goatsCaptured}/5`;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#475569';
    lines.forEach(line => {
        ctx.beginPath();
        const startNode = nodePositions[line[0]];
        ctx.moveTo(startNode.x, startNode.y);
        for (let i = 1; i < line.length; i++) {
            const node = nodePositions[line[i]];
            ctx.lineTo(node.x, node.y);
        }
        ctx.stroke();
    });

    // Draw nodes
    nodePositions.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();

        if (hoveredNode === node.id) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fill();
        }

        // Highlight valid moves for selected piece
        if (selectedPiece !== null && turn === board[selectedPiece]) {
            const validMoves = getValidMoves(selectedPiece);
            if (validMoves.includes(node.id)) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
                ctx.strokeStyle = turn === 'T' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(45, 212, 191, 0.5)';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        }
    });

    // Draw pieces
    nodePositions.forEach(node => {
        const piece = board[node.id];
        if (piece) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = piece === 'T' ? '#f97316' : '#2dd4bf';
            ctx.fill();
            
            if (piece === 'T') {
                ctx.strokeStyle = '#ea580c';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            if (selectedPiece === node.id) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 24, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    });
}

function getValidMoves(nodeId) {
    const piece = board[nodeId];
    if (!piece) return [];
    
    let moves = [];
    const adj = adjacencyList[nodeId];
    
    // Normal moves
    adj.forEach(neighbor => {
        if (board[neighbor] === null) {
            moves.push(neighbor);
        }
    });

    // Tiger jumps
    if (piece === 'T') {
        adj.forEach(neighbor => {
            if (board[neighbor] === 'G') {
                const jumpNodeId = getJumpNode(nodeId, neighbor);
                if (jumpNodeId !== null && board[jumpNodeId] === null) {
                    moves.push(jumpNodeId);
                }
            }
        });
    }
    return moves;
}

function getJumpNode(startId, midId) {
    const start = nodePositions[startId];
    const mid = nodePositions[midId];
    
    // Find node that forms a straight line: start -> mid -> end
    for (let endId of adjacencyList[midId]) {
        if (endId === startId) continue;
        const end = nodePositions[endId];
        
        // Check vectors (allow small floating point tolerance)
        const dx1 = mid.x - start.x;
        const dy1 = mid.y - start.y;
        const dx2 = end.x - mid.x;
        const dy2 = end.y - mid.y;
        
        if (Math.abs(dx1 - dx2) < 2 && Math.abs(dy1 - dy2) < 2) {
            return endId;
        }
    }
    return null;
}

function checkWinCondition() {
    if (goatsCaptured >= 5) {
        endGame('Tigers Win!');
        return;
    }

    // Check if tigers are blocked
    let tigersBlocked = true;
    for (let i = 0; i < 23; i++) {
        if (board[i] === 'T') {
            if (getValidMoves(i).length > 0) {
                tigersBlocked = false;
                break;
            }
        }
    }
    
    if (tigersBlocked) {
        endGame('Goats Win!');
    }
}

function endGame(message) {
    isGameOver = true;
    winnerTitle.textContent = message;
    winnerMessage.textContent = message === 'Tigers Win!' ? 'The tigers have captured 5 goats!' : 'The goats have successfully trapped the tigers!';
    gameOverModal.classList.remove('hidden');
}

// Event Listeners
canvas.addEventListener('mousemove', (e) => {
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoveredNode = null;
    for (let node of nodePositions) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx*dx + dy*dy) < 25) {
            hoveredNode = node.id;
            break;
        }
    }
    drawBoard();
});

canvas.addEventListener('click', () => {
    if (isGameOver || hoveredNode === null) return;

    if (turn === 'G' && phase === 'PLACEMENT') {
        if (board[hoveredNode] === null) {
            board[hoveredNode] = 'G';
            goatsPlaced++;
            if (goatsPlaced >= 15) phase = 'MOVEMENT';
            turn = 'T';
            selectedPiece = null;
        }
    } else {
        // Movement Phase or Tiger Turn
        const pieceAtNode = board[hoveredNode];

        if (pieceAtNode === turn) {
            // Select own piece
            selectedPiece = hoveredNode;
        } else if (selectedPiece !== null && pieceAtNode === null) {
            // Try to move to empty spot
            const validMoves = getValidMoves(selectedPiece);
            if (validMoves.includes(hoveredNode)) {
                // Execute move
                board[hoveredNode] = turn;
                board[selectedPiece] = null;
                
                // Check if it was a jump
                if (turn === 'T') {
                    const startNode = nodePositions[selectedPiece];
                    const endNode = nodePositions[hoveredNode];
                    // Find if there's a node between start and end (a jumped goat)
                    const midX = (startNode.x + endNode.x) / 2;
                    const midY = (startNode.y + endNode.y) / 2;
                    
                    for (let i = 0; i < 23; i++) {
                        const n = nodePositions[i];
                        if (Math.abs(n.x - midX) < 2 && Math.abs(n.y - midY) < 2) {
                            if (board[i] === 'G') {
                                board[i] = null; // Capture goat
                                goatsCaptured++;
                            }
                            break;
                        }
                    }
                }

                turn = turn === 'G' ? 'T' : 'G';
                selectedPiece = null;
                checkWinCondition();
            }
        }
    }
    
    updateUI();
    drawBoard();
});

restartBtn.addEventListener('click', initGame);
modalRestartBtn.addEventListener('click', initGame);

// Start game
initGame();
