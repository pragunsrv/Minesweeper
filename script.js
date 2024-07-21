document.addEventListener('DOMContentLoaded', () => {
    const gridSizeInput = document.getElementById('grid-size');
    const bombCountInput = document.getElementById('bomb-count');
    const customSettingsButton = document.getElementById('custom-settings-button');
    const resetButton = document.getElementById('reset-button');
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');
    const hintButton = document.getElementById('hint-button');
    const themeSelect = document.getElementById('theme-select');
    const statusText = document.getElementById('status-text');
    const timerDisplay = document.getElementById('timer');
    const flagsRemainingDisplay = document.getElementById('flags-remaining');
    const bestEasyDisplay = document.getElementById('best-easy');
    const bestMediumDisplay = document.getElementById('best-medium');
    const bestHardDisplay = document.getElementById('best-hard');
    const bestCustomDisplay = document.getElementById('best-custom');
    const historyList = document.getElementById('history-list');

    let gridSize = 10;
    let bombCount = 20;
    let gameArray = [];
    let flags = 0;
    let time = 0;
    let isGameOver = false;
    let timerInterval;
    let theme = 'light';
    let history = [];
    let undoStack = [];
    let redoStack = [];
    let hintUsed = false;

    const themes = {
        light: {
            background: '#f4f4f4',
            cell: '#c0c0c0',
            flagged: '#ffeb3b',
            bomb: '#f44336'
        },
        dark: {
            background: '#333',
            cell: '#555',
            flagged: '#ffeb3b',
            bomb: '#ff0000'
        }
    };

    function createBoard() {
        const grid = document.getElementById('minesweeper-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
        gameArray = Array(gridSize * gridSize).fill(null);
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleClick(cell));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(cell);
            });
            grid.appendChild(cell);
        }
        placeBombs();
        startTimer();
        updateFlagCount();
        applyTheme(theme);
        history = [];
        undoStack = [];
        redoStack = [];
        hintUsed = false;
    }

    function placeBombs() {
        let placedBombs = 0;
        while (placedBombs < bombCount) {
            const index = Math.floor(Math.random() * gameArray.length);
            if (gameArray[index] === null) {
                gameArray[index] = 'bomb';
                placedBombs++;
            }
        }
    }

    function handleClick(cell) {
        if (isGameOver || cell.classList.contains('flagged')) return;
        const index = cell.dataset.index;
        if (gameArray[index] === 'bomb') {
            revealBombs();
            statusText.textContent = 'Game Over';
            isGameOver = true;
            clearInterval(timerInterval);
            return;
        }
        revealCell(index);
        checkWin();
    }

    function revealCell(index) {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        if (cell.classList.contains('revealed')) return;
        cell.classList.add('revealed');
        const bombsAround = countBombsAround(index);
        if (bombsAround > 0) {
            cell.textContent = bombsAround;
            cell.classList.add(`num-${bombsAround}`);
        } else {
            cell.textContent = '';
            getAdjacentIndices(index).forEach(adjIndex => {
                if (!document.querySelector(`.cell[data-index="${adjIndex}"]`).classList.contains('revealed')) {
                    revealCell(adjIndex);
                }
            });
        }
    }

    function countBombsAround(index) {
        return getAdjacentIndices(index).reduce((count, adjIndex) => {
            return count + (gameArray[adjIndex] === 'bomb' ? 1 : 0);
        }, 0);
    }

    function getAdjacentIndices(index) {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const indices = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && !(r === row && c === col)) {
                    indices.push(r * gridSize + c);
                }
            }
        }
        return indices;
    }

    function handleRightClick(cell) {
        if (isGameOver || cell.classList.contains('revealed')) return;
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            flags--;
        } else {
            cell.classList.add('flagged');
            flags++;
        }
        updateFlagCount();
    }

    function updateFlagCount() {
        flagsRemainingDisplay.textContent = bombCount - flags;
    }

    function revealBombs() {
        gameArray.forEach((value, index) => {
            if (value === 'bomb') {
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                cell.classList.add('bomb');
            }
        });
    }

    function startTimer() {
        time = 0;
        timerInterval = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function applyTheme(themeName) {
        const themeColors = themes[themeName];
        document.body.style.backgroundColor = themeColors.background;
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.backgroundColor = themeColors.cell;
            if (cell.classList.contains('flagged')) {
                cell.style.backgroundColor = themeColors.flagged;
            }
            if (cell.classList.contains('bomb')) {
                cell.style.backgroundColor = themeColors.bomb;
            }
        });
    }

    function saveGame() {
        const gameData = {
            gridSize,
            bombCount,
            gameArray,
            flags,
            time,
            theme
        };
        localStorage.setItem('minesweeperGame', JSON.stringify(gameData));
    }

    function loadGame() {
        const savedGame = localStorage.getItem('minesweeperGame');
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
            gridSize = gameData.gridSize;
            bombCount = gameData.bombCount;
            gameArray = gameData.gameArray;
            flags = gameData.flags;
            time = gameData.time;
            theme = gameData.theme;
            createBoard();
            updateFlagCount();
            timerDisplay.textContent = time;
        } else {
            alert('No saved game found.');
        }
    }

    function resetGame() {
        clearInterval(timerInterval);
        time = 0;
        timerDisplay.textContent = time;
        isGameOver = false;
        createBoard();
    }

    function updateBestTimes() {
        const bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || {};
        if (!bestTimes.easy || time < bestTimes.easy) {
            bestTimes.easy = time;
            bestEasyDisplay.textContent = time + ' seconds';
        }
        if (!bestTimes.medium || time < bestTimes.medium) {
            bestTimes.medium = time;
            bestMediumDisplay.textContent = time + ' seconds';
        }
        if (!bestTimes.hard || time < bestTimes.hard) {
            bestTimes.hard = time;
            bestHardDisplay.textContent = time + ' seconds';
        }
        if (!bestTimes.custom || time < bestTimes.custom) {
            bestTimes.custom = time;
            bestCustomDisplay.textContent = time + ' seconds';
        }
        localStorage.setItem('bestTimes', JSON.stringify(bestTimes));
    }

    function addHistoryEntry() {
        const historyEntry = document.createElement('li');
        historyEntry.textContent = `Time: ${time} seconds, Flags Remaining: ${bombCount - flags}`;
        historyList.appendChild(historyEntry);
    }

    function getHint() {
        if (hintUsed) {
            alert('Hint already used.');
            return;
        }
        let emptyCells = [];
        document.querySelectorAll('.cell').forEach(cell => {
            if (!cell.classList.contains('revealed') && !cell.classList.contains('flagged')) {
                emptyCells.push(cell);
            }
        });
        if (emptyCells.length === 0) {
            alert('No hints available.');
            return;
        }
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = cell.dataset.index;
        revealCell(index);
        hintUsed = true;
    }

    function undoMove() {
        if (undoStack.length === 0) return;
        const lastMove = undoStack.pop();
        const cell = document.querySelector(`.cell[data-index="${lastMove.index}"]`);
        cell.classList.remove('revealed');
        cell.classList.remove('flagged');
        if (lastMove.flagged) {
            cell.classList.add('flagged');
        }
        updateFlagCount();
        redoStack.push(lastMove);
    }

    function redoMove() {
        if (redoStack.length === 0) return;
        const lastRedo = redoStack.pop();
        const cell = document.querySelector(`.cell[data-index="${lastRedo.index}"]`);
        cell.classList.add('revealed');
        if (lastRedo.flagged) {
            cell.classList.add('flagged');
        }
        updateFlagCount();
        undoStack.push(lastRedo);
    }

    function checkWin() {
        const cells = document.querySelectorAll('.cell');
        const revealedCells = Array.from(cells).filter(cell => cell.classList.contains('revealed'));
        if (revealedCells.length === cells.length - bombCount) {
            statusText.textContent = 'You Win!';
            isGameOver = true;
            clearInterval(timerInterval);
            updateBestTimes();
            addHistoryEntry();
        }
    }

    customSettingsButton.addEventListener('click', () => {
        gridSize = parseInt(gridSizeInput.value);
        bombCount = parseInt(bombCountInput.value);
        theme = themeSelect.value;
        resetGame();
    });

    resetButton.addEventListener('click', resetGame);
    saveButton.addEventListener('click', saveGame);
    loadButton.addEventListener('click', loadGame);
    hintButton.addEventListener('click', getHint);
    undoButton.addEventListener('click', undoMove);
    redoButton.addEventListener('click', redoMove);

    // Initialize game
    createBoard();
});
