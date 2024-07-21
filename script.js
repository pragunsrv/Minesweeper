document.addEventListener('DOMContentLoaded', () => {
    const gridSizeInput = document.getElementById('grid-size');
    const bombCountInput = document.getElementById('bomb-count');
    const customSettingsButton = document.getElementById('custom-settings-button');
    const resetButton = document.getElementById('reset-button');
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');
    const themeSelect = document.getElementById('theme-select');
    const statusText = document.getElementById('status-text');
    const timerDisplay = document.getElementById('timer');
    const flagsRemainingDisplay = document.getElementById('flags-remaining');
    const bestEasyDisplay = document.getElementById('best-easy');
    const bestMediumDisplay = document.getElementById('best-medium');
    const bestHardDisplay = document.getElementById('best-hard');
    
    let gridSize = 10;
    let bombCount = 20;
    let gameArray = [];
    let flags = 0;
    let time = 0;
    let isGameOver = false;
    let timerInterval;
    let theme = 'light';

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
        applyTheme(theme);
        placeBombs();
        updateFlagCount();
        startTimer();
    }

    function placeBombs() {
        let bombsPlaced = 0;
        while (bombsPlaced < bombCount) {
            const index = Math.floor(Math.random() * gameArray.length);
            if (gameArray[index] !== 'bomb') {
                gameArray[index] = 'bomb';
                bombsPlaced++;
            }
        }
    }

    function handleClick(cell) {
        if (isGameOver || cell.classList.contains('flagged')) return;
        const index = cell.dataset.index;
        if (gameArray[index] === 'bomb') {
            revealBombs();
            statusText.textContent = 'Game Over!';
            isGameOver = true;
            stopTimer();
        } else {
            revealCell(cell, index);
        }
    }

    function handleRightClick(cell) {
        if (isGameOver) return;
        const index = cell.dataset.index;
        if (cell.classList.contains('revealed')) return;
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            flags--;
        } else {
            cell.classList.add('flagged');
            flags++;
        }
        updateFlagCount();
    }

    function revealCell(cell, index) {
        if (cell.classList.contains('revealed')) return;
        cell.classList.add('revealed');
        const numBombs = countAdjacentBombs(index);
        if (numBombs > 0) {
            cell.textContent = numBombs;
            cell.classList.add(`num-${numBombs}`);
        } else {
            getAdjacentIndices(index).forEach((adjIndex) => {
                const adjCell = document.querySelector(`.cell[data-index='${adjIndex}']`);
                revealCell(adjCell, adjIndex);
            });
        }
    }

    function countAdjacentBombs(index) {
        return getAdjacentIndices(index).filter(i => gameArray[i] === 'bomb').length;
    }

    function getAdjacentIndices(index) {
        const adjIndices = [];
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    const adjIndex = r * gridSize + c;
                    if (adjIndex !== parseInt(index)) {
                        adjIndices.push(adjIndex);
                    }
                }
            }
        }
        return adjIndices;
    }

    function revealBombs() {
        document.querySelectorAll('.cell').forEach((cell) => {
            const index = cell.dataset.index;
            if (gameArray[index] === 'bomb') {
                cell.classList.add('bomb');
                cell.textContent = '💣';
            }
        });
    }

    function updateFlagCount() {
        flagsRemainingDisplay.textContent = bombCount - flags;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetGame() {
        if (isGameOver) {
            isGameOver = false;
            time = 0;
            timerDisplay.textContent = time;
            updateFlagCount();
            createBoard();
        } else {
            stopTimer();
            startTimer();
        }
        statusText.textContent = 'Game in Progress';
    }

    function saveGameState() {
        localStorage.setItem('minesweeperState', JSON.stringify({
            gridSize,
            bombCount,
            gameArray,
            flags,
            time,
            isGameOver
        }));
        saveBestTime();
    }

    function loadGameState() {
        const savedState = JSON.parse(localStorage.getItem('minesweeperState'));
        if (savedState) {
            gridSize = savedState.gridSize;
            bombCount = savedState.bombCount;
            gameArray = savedState.gameArray;
            flags = savedState.flags;
            time = savedState.time;
            isGameOver = savedState.isGameOver;
            createBoard();
            updateFlagCount();
            timerDisplay.textContent = time;
            statusText.textContent = isGameOver ? 'Game Over!' : 'Game in Progress';
            if (!isGameOver) startTimer();
        }
    }

    function applyTheme(selectedTheme) {
        theme = selectedTheme;
        document.body.style.backgroundColor = themes[theme].background;
        document.querySelectorAll('.cell').forEach((cell) => {
            cell.style.backgroundColor = themes[theme].cell;
            if (cell.classList.contains('flagged')) {
                cell.style.backgroundColor = themes[theme].flagged;
            } else if (cell.classList.contains('bomb')) {
                cell.style.backgroundColor = themes[theme].bomb;
            }
        });
    }

    function saveBestTime() {
        const timeKey = getDifficultyKey();
        const bestTime = localStorage.getItem(timeKey);
        if (!bestTime || time < parseInt(bestTime)) {
            localStorage.setItem(timeKey, time);
            updateBestTimeDisplay();
        }
    }

    function updateBestTimeDisplay() {
        bestEasyDisplay.textContent = localStorage.getItem('bestEasy') || 'N/A';
        bestMediumDisplay.textContent = localStorage.getItem('bestMedium') || 'N/A';
        bestHardDisplay.textContent = localStorage.getItem('bestHard') || 'N/A';
    }

    function getDifficultyKey() {
        if (gridSize === 10 && bombCount === 20) return 'bestEasy';
        if (gridSize === 15 && bombCount === 40) return 'bestMedium';
        if (gridSize === 20 && bombCount === 99) return 'bestHard';
        return 'bestCustom';
    }

    resetButton.addEventListener('click', () => {
        resetGame();
    });

    customSettingsButton.addEventListener('click', () => {
        gridSize = parseInt(gridSizeInput.value);
        bombCount = parseInt(bombCountInput.value);
        if (gridSize < 5) gridSize = 5;
        if (bombCount < 1) bombCount = 1;
        resetGame();
    });

    saveButton.addEventListener('click', saveGameState);
    loadButton.addEventListener('click', loadGameState);
    themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));

    updateBestTimeDisplay();
    createBoard();
    startTimer();
});
