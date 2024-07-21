document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const timerDisplay = document.getElementById('timer');
    const flagsRemainingDisplay = document.getElementById('flags-remaining');
    const statusText = document.getElementById('status-text');
    const bestEasyDisplay = document.getElementById('best-easy');
    const bestMediumDisplay = document.getElementById('best-medium');
    const bestHardDisplay = document.getElementById('best-hard');
    const bestCustomDisplay = document.getElementById('best-custom');
    const historyList = document.getElementById('history');
    const resetButton = document.getElementById('reset-button');
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');
    const hintButton = document.getElementById('hint-button');
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');
    const difficultySelect = document.getElementById('difficulty');
    const customSettings = document.getElementById('custom-settings');
    const gridSizeInput = document.getElementById('grid-size');
    const bombCountInput = document.getElementById('bomb-count');
    const applyCustomSettingsButton = document.getElementById('apply-custom-settings');
    const themeSelect = document.getElementById('theme');

    let gridSize = 10;
    let bombCount = 10;
    let theme = 'light';
    let gameArray = [];
    let flags = 0;
    let time = 0;
    let timerInterval;
    let isGameOver = false;
    let history = [];
    let undoStack = [];
    let redoStack = [];
    let hintUsed = false;

    const themes = {
        light: {
            background: '#f0f0f0',
            cell: '#ddd',
            flagged: '#f5a623',
            bomb: 'red'
        },
        dark: {
            background: '#333',
            cell: '#555',
            flagged: '#f5a623',
            bomb: 'red'
        }
    };

    function createBoard() {
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
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
            cell.classList.add('bomb');
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
        if (!cell || cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');
        const neighboringBombs = countNeighboringBombs(index);
        if (neighboringBombs > 0) {
            cell.textContent = neighboringBombs;
            cell.classList.add(`num-${neighboringBombs}`);
        } else {
            const neighbors = getNeighborIndices(index);
            neighbors.forEach(neighbor => revealCell(neighbor));
        }
    }

    function countNeighboringBombs(index) {
        const neighbors = getNeighborIndices(index);
        return neighbors.reduce((count, neighbor) => {
            return count + (gameArray[neighbor] === 'bomb' ? 1 : 0);
        }, 0);
    }

    function getNeighborIndices(index) {
        const neighbors = [];
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && !(r === row && c === col)) {
                    neighbors.push(r * gridSize + c);
                }
            }
        }
        return neighbors;
    }

    function revealBombs() {
        gameArray.forEach((cell, index) => {
            if (cell === 'bomb') {
                const cellElement = document.querySelector(`.cell[data-index="${index}"]`);
                cellElement.classList.add('bomb');
                cellElement.textContent = '💣';
            }
        });
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
        flagsRemainingDisplay.textContent = `Flags: ${bombCount - flags}`;
    }

    function startTimer() {
        time = 0;
        timerInterval = setInterval(() => {
            time++;
            timerDisplay.textContent = `Time: ${time}`;
        }, 1000);
    }

    function checkWin() {
        const revealedCells = document.querySelectorAll('.cell.revealed').length;
        if (revealedCells + bombCount === gridSize * gridSize) {
            statusText.textContent = 'You Win!';
            clearInterval(timerInterval);
            isGameOver = true;
        }
    }

    function resetGame() {
        clearInterval(timerInterval);
        createBoard();
        isGameOver = false;
        statusText.textContent = 'Welcome to Minesweeper!';
    }

    function saveGame() {
        const gameState = {
            gridSize,
            bombCount,
            theme,
            gameArray,
            time,
            flags
        };
        localStorage.setItem('minesweeper', JSON.stringify(gameState));
    }

    function loadGame() {
        const gameState = JSON.parse(localStorage.getItem('minesweeper'));
        if (gameState) {
            gridSize = gameState.gridSize;
            bombCount = gameState.bombCount;
            theme = gameState.theme;
            gameArray = gameState.gameArray;
            time = gameState.time;
            flags = gameState.flags;
            createBoard();
            timerDisplay.textContent = `Time: ${time}`;
            flagsRemainingDisplay.textContent = `Flags: ${bombCount - flags}`;
        } else {
            statusText.textContent = 'No saved game found.';
        }
    }

    function applyCustomSettings() {
        gridSize = parseInt(gridSizeInput.value, 10);
        bombCount = parseInt(bombCountInput.value, 10);
        theme = themeSelect.value;
        createBoard();
        customSettings.classList.add('hidden');
    }

    function showHint() {
        if (isGameOver || hintUsed) return;
        const emptyCells = Array.from(document.querySelectorAll('.cell')).filter(cell => !cell.classList.contains('revealed') && !cell.classList.contains('flagged'));
        if (emptyCells.length === 0) return;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = randomCell.dataset.index;
        revealCell(index);
        hintUsed = true;
        statusText.textContent = 'Hint used!';
    }

    function undoMove() {
        // Implement undo functionality here
    }

    function redoMove() {
        // Implement redo functionality here
    }

    function applyTheme(theme) {
        document.body.style.backgroundColor = themes[theme].background;
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.backgroundColor = themes[theme].cell;
        });
    }

    resetButton.addEventListener('click', resetGame);
    saveButton.addEventListener('click', saveGame);
    loadButton.addEventListener('click', loadGame);
    hintButton.addEventListener('click', showHint);
    undoButton.addEventListener('click', undoMove);
    redoButton.addEventListener('click', redoMove);
    applyCustomSettingsButton.addEventListener('click', applyCustomSettings);
    difficultySelect.addEventListener('change', (e) => {
        switch (e.target.value) {
            case 'easy':
                gridSize = 8;
                bombCount = 10;
                break;
            case 'medium':
                gridSize = 16;
                bombCount = 40;
                break;
            case 'hard':
                gridSize = 24;
                bombCount = 99;
                break;
            case 'custom':
                customSettings.classList.remove('hidden');
                return;
        }
        createBoard();
    });

    createBoard();
});
