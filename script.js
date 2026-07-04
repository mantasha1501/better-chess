/**
 * BALATRO CHESS ENGINE // POSITIONAL ENGINE & DEEP MINIMAX ALTERNATIVE
 * Fully compliant chess logic with Shuffled Alpha-Beta structural evaluation layers.
 */

let board = [];
let turn = "w"; 
let selectedSquare = null;
let activeLegalMoves = [];
let gameMode = "PVP";
let botDifficulty = 2;
let botThinking = false;

let kingPositions = { w: {r: 7, c: 4}, b: {r: 0, c: 4} };

// Tracking elements for special historical rule mechanics
let castlingRights = {
    w: { kingSide: true, queenSide: true },
    b: { kingSide: true, queenSide: true }
};
let enPassantTarget = null; 

const glyphs = {
    'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔',
    'bP': '♟', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚'
};

// Base material metrics
const pieceValues = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };

/**
 * PIECE-SQUARE POSITION MATRIX TABLES (PST)
 */
const pawnPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopPST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const queenPST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingPST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

function changeMode(mode) {
    if (botThinking) return;
    gameMode = mode;
    document.getElementById("modePVP").classList.toggle("active", mode === "PVP");
    document.getElementById("modeCPU").classList.toggle("active", mode === "CPU");
    document.getElementById("cpuSubPanel").classList.toggle("hidden", mode === "PVP");
    initPerfectChessMatch();
}

function changeDifficulty() {
    botDifficulty = parseInt(document.getElementById("botLevel").value);
    addLog(`[SYS]: Ante Difficulty shifted to Lvl 0${botDifficulty}`);
}

function initPerfectChessMatch() {
    turn = "w";
    selectedSquare = null;
    activeLegalMoves = [];
    botThinking = false;
    kingPositions = { w: {r: 7, c: 4}, b: {r: 0, c: 4} };
    castlingRights = {
        w: { kingSide: true, queenSide: true },
        b: { kingSide: true, queenSide: true }
    };
    enPassantTarget = null;

    board = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];

    document.getElementById("logStream").innerHTML = `<div class="log-line">[RUN]: Deck shuffled. White up first.</div>`;
    setGameStatus("STABLE", false);
    syncUI();
}

function syncUI() {
    const lbl = document.getElementById("turnLabel");
    if (turn === "w") {
        lbl.innerText = "WHITE TURN";
        lbl.className = "val text-white";
    } else {
        lbl.innerText = "BLACK TURN";
        lbl.className = "val text-neon";
    }
    renderBoard();
}

function renderBoard() {
    const grid = document.getElementById("chessBoardGrid");
    grid.innerHTML = "";

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const tile = document.createElement("div");
            const isDark = (r + c) % 2 === 1;
            tile.className = `b-tile ${isDark ? 'dark-sq' : 'light-sq'}`;

            const p = board[r][c];
            if (p) {
                const pSpan = document.createElement("span");
                pSpan.className = `piece ${p[0] === 'w' ? 'w-team' : 'b-team'}`;
                pSpan.innerText = glyphs[p];
                tile.appendChild(pSpan);
            }

            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                tile.classList.add("selected");
            }

            const targetMove = activeLegalMoves.find(m => m.to.r === r && m.to.c === c);
            if (targetMove) {
                tile.classList.add("valid-move");
                if (p || targetMove.isEnPassant) tile.classList.add("is-cap");
            }

            tile.onclick = () => onSquareClick(r, c);
            grid.appendChild(tile);
        }
    }
}

function onSquareClick(r, c) {
    if (botThinking || (gameMode === "CPU" && turn === "b")) return;

    const targetMove = activeLegalMoves.find(m => m.to.r === r && m.to.c === c);
    if (targetMove) {
        executeMove(targetMove);
        return;
    }

    const p = board[r][c];
    if (p && p[0] === turn) {
        selectedSquare = {r, c};
        activeLegalMoves = getStrictLegalMoves(r, c, board, turn);
        renderBoard();
        return;
    }

    selectedSquare = null;
    activeLegalMoves = [];
    renderBoard();
}

function getStrictLegalMoves(r, c, targetBoard, alliance) {
    const p = targetBoard[r][c];
    if (!p) return [];

    const rawMoves = getRawPieceTrajectories(r, c, targetBoard);
    let strictMoves = [];

    rawMoves.forEach(m => {
        let virtualBoard = targetBoard.map(row => [...row]);
        virtualBoard[m.to.r][m.to.c] = virtualBoard[m.from.r][m.from.c];
        virtualBoard[m.from.r][m.from.c] = null;

        let tempKingPos = { ...kingPositions[alliance] };
        if (targetBoard[m.from.r][m.from.c][1] === 'K') {
            tempKingPos = { r: m.to.r, c: m.to.c };
        }

        if (!isKingThreatenedInPosition(tempKingPos, virtualBoard, alliance)) {
            strictMoves.push(m);
        }
    });

    // Handle special rule logic filters on the active matching board
    if (targetBoard === board) {
        if (p[1] === 'K') {
            const kingPos = kingPositions[alliance];
            if (!isKingThreatenedInPosition(kingPos, targetBoard, alliance)) {
                const rights = castlingRights[alliance];
                // King side castling
                if (rights.kingSide && !targetBoard[r][5] && !targetBoard[r][6]) {
                    if (!isKingThreatenedInPosition({r, c: 5}, targetBoard, alliance) && !isKingThreatenedInPosition({r, c: 6}, targetBoard, alliance)) {
                        strictMoves.push({ from: {r, c}, to: {r, c: 6}, isCastling: "king" });
                    }
                }
                // Queen side castling
                if (rights.queenSide && !targetBoard[r][1] && !targetBoard[r][2] && !targetBoard[r][3]) {
                    if (!isKingThreatenedInPosition({r, c: 2}, targetBoard, alliance) && !isKingThreatenedInPosition({r, c: 3}, targetBoard, alliance)) {
                        strictMoves.push({ from: {r, c}, to: {r, c: 2}, isCastling: "queen" });
                    }
                }
            }
        }

        if (p[1] === 'P' && enPassantTarget) {
            const dir = alliance === 'w' ? -1 : 1;
            if (r === enPassantTarget.r && Math.abs(c - enPassantTarget.c) === 1) {
                let m = { 
                    from: {r, c}, 
                    to: {r: r + dir, c: enPassantTarget.c}, 
                    isEnPassant: true, 
                    capturedPawnPos: {r: enPassantTarget.r, c: enPassantTarget.c} 
                };
                let virtualBoard = targetBoard.map(row => [...row]);
                virtualBoard[m.to.r][m.to.c] = virtualBoard[m.from.r][m.from.c];
                virtualBoard[m.from.r][m.from.c] = null;
                virtualBoard[m.capturedPawnPos.r][m.capturedPawnPos.c] = null;
                if (!isKingThreatenedInPosition(kingPositions[alliance], virtualBoard, alliance)) {
                    strictMoves.push(m);
                }
            }
        }
    }

    return strictMoves;
}

function isKingThreatenedInPosition(kingPos, targetBoard, alliance) {
    const opponent = alliance === "w" ? "b" : "w";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = targetBoard[r][c];
            if (p && p[0] === opponent) {
                const dangerTrajectories = getRawPieceTrajectories(r, c, targetBoard);
                if (dangerTrajectories.some(m => m.to.r === kingPos.r && m.to.c === kingPos.c)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getRawPieceTrajectories(r, c, targetBoard) {
    const p = targetBoard[r][c];
    if (!p) return [];
    const alliance = p[0];
    const type = p[1];
    let moves = [];

    const add = (targetR, targetC) => {
        if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
            const destPiece = targetBoard[targetR][targetC];
            if (!destPiece || destPiece[0] !== alliance) {
                moves.push({ from: {r, c}, to: {r: targetR, c: targetC} });
                return !destPiece; 
            }
        }
        return false;
    };

    if (type === 'P') {
        const dir = alliance === 'w' ? -1 : 1;
        const startRow = alliance === 'w' ? 6 : 1;
        
        if (r + dir >= 0 && r + dir < 8 && !targetBoard[r + dir][c]) {
            moves.push({ from: {r, c}, to: {r: r + dir, c} });
            if (r === startRow && !targetBoard[r + (dir * 2)][c]) {
                moves.push({ from: {r, c}, to: {r: r + (dir * 2), c} });
            }
        }
        [-1, 1].forEach(dc => {
            if (c + dc >= 0 && c + dc < 8 && targetBoard[r + dir][c + dc] && targetBoard[r + dir][c + dc][0] !== alliance) {
                moves.push({ from: {r, c}, to: {r: r + dir, c: c + dc} });
            }
        });
    }
    else if (type === 'N') {
        const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        jumps.forEach(([dr, dc]) => add(r + dr, c + dc));
    }
    else if (type === 'R' || type === 'Q') {
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
            let step = 1;
            while (add(r + dr * step, c + dc * step)) step++;
        });
    }
    if (type === 'B' || type === 'Q') {
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
            let step = 1;
            while (add(r + dr * step, c + dc * step)) step++;
        });
    }
    else if (type === 'K') {
        [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => add(r + dr, c + dc));
    }

    return moves;
}

function getAllTeamMoves(targetBoard, team) {
    let list = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (targetBoard[r][c] && targetBoard[r][c][0] === team) {
                list = list.concat(getStrictLegalMoves(r, c, targetBoard, team));
            }
        }
    }
    return list;
}

function executeMove(m) {
    const p = board[m.from.r][m.from.c];
    const cap = board[m.to.r][m.to.c];
    let nextEnPassantTarget = null;

    if (m.isCastling) {
        board[m.to.r][m.to.c] = p;
        board[m.from.r][m.from.c] = null;
        if (m.isCastling === "king") {
            board[m.to.r][5] = p[0] + 'R';
            board[m.to.r][7] = null;
        } else {
            board[m.to.r][3] = p[0] + 'R';
            board[m.to.r][0] = null;
        }
    } else if (m.isEnPassant) {
        board[m.to.r][m.to.c] = p;
        board[m.from.r][m.from.c] = null;
        board[m.capturedPawnPos.r][m.capturedPawnPos.c] = null;
    } else {
        if (p[1] === 'P' && Math.abs(m.to.r - m.from.r) === 2) {
            nextEnPassantTarget = { r: m.to.r, c: m.to.c };
        }
        board[m.to.r][m.to.c] = p;
        board[m.from.r][m.from.c] = null;
    }

    if (p[1] === 'K') {
        kingPositions[p[0]] = { r: m.to.r, c: m.to.c };
        castlingRights[p[0]].kingSide = false;
        castlingRights[p[0]].queenSide = false;
    }

    if (p[1] === 'R') {
        if (m.from.r === (p[0] === 'w' ? 7 : 0)) {
            if (m.from.c === 7) castlingRights[p[0]].kingSide = false;
            if (m.from.c === 0) castlingRights[p[0]].queenSide = false;
        }
    }

    if (cap && cap[1] === 'R') {
        const opp = p[0] === 'w' ? 'b' : 'w';
        if (m.to.r === (opp === 'w' ? 7 : 0)) {
            if (m.to.c === 7) castlingRights[opp].kingSide = false;
            if (m.to.c === 0) castlingRights[opp].queenSide = false;
        }
    }

    if (p[1] === 'P' && (m.to.r === 0 || m.to.r === 7)) {
        board[m.to.r][m.to.c] = p[0] + 'Q';
    }

    enPassantTarget = nextEnPassantTarget;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    addLog(`${p[0].toUpperCase()} : ${p[1] !== 'P' ? p[1] : ''}${files[m.from.c]}${8 - m.from.r} ➔ ${files[m.to.c]}${8 - m.to.r}${cap || m.isEnPassant ? ' ✕' : ''}`, p[0]);

    turn = turn === 'w' ? 'b' : 'w';
    selectedSquare = null;
    activeLegalMoves = [];

    const opponentKing = kingPositions[turn];
    const isUnderCheck = isKingThreatenedInPosition(opponentKing, board, turn);
    let totalOpponentValidMoves = getAllTeamMoves(board, turn);

    if (totalOpponentValidMoves.length === 0) {
        if (isUnderCheck) {
            setGameStatus("CHECKMATE", true);
            addLog(`[SYS]: MATCH ENDED BY CHECKMATE.`);
        } else {
            setGameStatus("STALEMATE", true);
            addLog(`[SYS]: STALEMATE ENCOUNTERED.`);
        }
        syncUI();
        return;
    }

    if (isUnderCheck) {
        setGameStatus("KING UNDER CHECK", true);
    } else {
        setGameStatus("STABLE", false);
    }

    syncUI();

    if (gameMode === "CPU" && turn === "b") {
        runBotPipeline();
    }
}

function runBotPipeline() {
    botThinking = true;
    document.getElementById("gameStatusIndicator").innerText = "BOT COMPUTING LINES...";
    
    setTimeout(() => {
        let availableMoves = getAllTeamMoves(board, 'b');

        if (availableMoves.length === 0) {
            botThinking = false;
            return;
        }

        let searchDepth = (botDifficulty === 1) ? 1 : (botDifficulty === 2) ? 2 : 3;

        let alpha = -Infinity;
        let beta = Infinity;
        let bestScore = -Infinity;
        let optimalMovesPool = [];

        availableMoves.sort(() => Math.random() - 0.5);

        availableMoves.sort((a, b) => {
            let scoreA = board[a.to.r][a.to.c] ? pieceValues[board[a.to.r][a.to.c][1]] : 0;
            let scoreB = board[b.to.r][b.to.c] ? pieceValues[board[b.to.r][b.to.c][1]] : 0;
            return scoreB - scoreA;
        });

        availableMoves.forEach(m => {
            let virtualBoard = board.map(row => [...row]);
            let savedKingPos = { ...kingPositions.b };
            
            if (virtualBoard[m.from.r][m.from.c][1] === 'K') kingPositions.b = {r: m.to.r, c: m.to.c};
            
            virtualBoard[m.to.r][m.to.c] = virtualBoard[m.from.r][m.from.c];
            virtualBoard[m.from.r][m.from.c] = null;

            let score = minimax(virtualBoard, searchDepth - 1, alpha, beta, false);
            
            if (botDifficulty === 1) {
                score += (Math.floor(Math.random() * 60) - 30);
            } else if (botDifficulty === 2) {
                score += (Math.floor(Math.random() * 16) - 8);
            }

            kingPositions.b = savedKingPos;

            if (score > bestScore) {
                bestScore = score;
                optimalMovesPool = [m]; 
            } else if (score === bestScore) {
                optimalMovesPool.push(m); 
            }
            alpha = Math.max(alpha, score);
        });

        botThinking = false;
        
        if (optimalMovesPool.length > 0) {
            let finalizedChoice = optimalMovesPool[Math.floor(Math.random() * optimalMovesPool.length)];
            executeMove(finalizedChoice);
        }
    }, 400);
}

function minimax(vBoard, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return evaluateCompleteBoard(vBoard);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        let moves = getAllTeamMoves(vBoard, 'b');
        if (moves.length === 0) return -10000;

        for (let i = 0; i < moves.length; i++) {
            let virtual = vBoard.map(row => [...row]);
            let savedKing = { ...kingPositions.b };
            if (virtual[moves[i].from.r][moves[i].from.c][1] === 'K') kingPositions.b = {r: moves[i].to.r, c: moves[i].to.c};

            virtual[moves[i].to.r][moves[i].to.c] = virtual[moves[i].from.r][moves[i].from.c];
            virtual[moves[i].from.r][moves[i].from.c] = null;

            let evaluation = minimax(virtual, depth - 1, alpha, beta, false);
            kingPositions.b = savedKing;
            
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        let moves = getAllTeamMoves(vBoard, 'w');
        if (moves.length === 0) return 10000;

        for (let i = 0; i < moves.length; i++) {
            let virtual = vBoard.map(row => [...row]);
            let savedKing = { ...kingPositions.w };
            if (virtual[moves[i].from.r][moves[i].from.c][1] === 'K') kingPositions.w = {r: moves[i].to.r, c: moves[i].to.c};

            virtual[moves[i].to.r][moves[i].to.c] = virtual[moves[i].from.r][moves[i].from.c];
            virtual[moves[i].from.r][moves[i].from.c] = null;

            let evaluation = minimax(virtual, depth - 1, alpha, beta, true);
            kingPositions.w = savedKing;

            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateCompleteBoard(vBoard) {
    let totalScore = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = vBoard[r][c];
            if (!p) continue;

            const side = p[0];
            const type = p[1];
            let val = pieceValues[type] || 0;
            let positionalBonus = 0;
            
            if (type === 'P') positionalBonus = pawnPST[side === 'w' ? r : 7 - r][c];
            else if (type === 'N') positionalBonus = knightPST[side === 'w' ? r : 7 - r][c];
            else if (type === 'B') positionalBonus = bishopPST[side === 'w' ? r : 7 - r][c];
            else if (type === 'R') positionalBonus = rookPST[side === 'w' ? r : 7 - r][c];
            else if (type === 'Q') positionalBonus = queenPST[side === 'w' ? r : 7 - r][c];
            else if (type === 'K') positionalBonus = kingPST[side === 'w' ? r : 7 - r][c];

            let cumulative = val + positionalBonus;
            if (side === 'b') totalScore += cumulative;
            else totalScore -= cumulative;
        }
    }
    return totalScore;
}

function setGameStatus(txt, dangerous = false) {
    const indicator = document.getElementById("gameStatusIndicator");
    indicator.innerText = txt.toUpperCase();
    indicator.className = `stat-val ${dangerous ? 'status-red' : 'status-green'}`;
}

function addLog(txt, side = '') {
    const box = document.getElementById("logStream");
    const line = document.createElement("div");
    line.className = `log-line ${side}`;
    line.innerText = txt;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
}

initPerfectChessMatch();