document.addEventListener('DOMContentLoaded', () => {
    const gridSizeInput = document.getElementById('grid-size');
    const bombCountInput = document.getElementById('bomb-count');
    const difficultySelect = document.getElementById('difficulty-select');
    const customSettingsButton = document.getElementById('custom-settings-button');
    const resetButton = document.getElementById('reset-button');
    const statusText = document.getElementById('status-text');
    const flagsRemainingDisplay = document.getElementById('flags-remaining');
    const timerDisplay = document.getElementById('timer');
    const historyList = document.getElementById('history-list');
    const bestTimes = {
        easy: null,
        medium: null,
        hard: null
    };

    let gridSize = 10;
    let bombCount = 20;
    let width;
    let cells = [];
    let gameArray = [];
    let flags = 0;
    let isGameOver = false;
    let time = 0;
    let timer;
    let gameHistory = [];

    function createBoard() {
        isGameOver = false;
        time = 0;
        flags = 0;
        flagsRemainingDisplay.textContent = bombCount;
        timerDisplay.textContent = time;
        statusText.textContent = 'Game in Progress';

        const grid = document.getElementById('minesweeper-grid');
        grid.innerHTML = ''; // Clear the grid

        width = gridSize;
        grid.style.gridTemplateColumns = `repeat(${width}, 40px)`;

        cells = [];
        gameArray = Array(width * width).fill(null);

        // Place bombs
        let bombsPlaced = 0;
        while (bombsPlaced < bombCount) {
            const randomIndex = Math.floor(Math.random() * gameArray.length);
            if (gameArray[randomIndex] !== 'bomb') {
                gameArray[randomIndex] = 'bomb';
                bombsPlaced++;
            }
        }

        // Set numbers
        for (let i = 0; i < gameArray.length; i++) {
            if (gameArray[i] !== 'bomb') {
                const total = getSurroundingCells(i).reduce((acc, id) => acc + (gameArray[id] === 'bomb' ? 1 : 0), 0);
                gameArray[i] = total;
            }
        }

        // Create cells
        for (let i = 0; i < gameArray.length; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data', gameArray[i]);
            cell.id = i;
            cell.addEventListener('click', () => click(cell));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                addFlag(cell);
            });
            grid.appendChild(cell);
            cells.push(cell);
        }
    }

    function click(cell) {
        if (isGameOver || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

        const currentId = cell.id;
        if (gameArray[currentId] === 'bomb') {
            gameOver();
            return;
        }
        revealCell(cell);
    }

    function revealCell(cell) {
        if (cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');
        const data = cell.getAttribute('data');
        if (data != 0) {
            cell.textContent = data;
            cell.classList.add(`num-${data}`);
        } else {
            getSurroundingCells(cell.id).forEach(id => {
                const surroundingCell = cells[id];
                if (surroundingCell && !surroundingCell.classList.contains('revealed')) {
                    click(surroundingCell);
                }
            });
        }
        checkWin();
    }

    function getSurroundingCells(id) {
        const surroundingIds = [];
        const isLeftEdge = id % width === 0;
        const isRightEdge = id % width === width - 1;

        if (id > 0 && !isLeftEdge) surroundingIds.push(parseInt(id) - 1);
        if (id > width - 1 && !isRightEdge) surroundingIds.push(parseInt(id) + 1 - width);
        if (id > width) surroundingIds.push(parseInt(id) - width);
        if (id > width && !isLeftEdge) surroundingIds.push(parseInt(id) - 1 - width);
        if (id < (width * (width - 1)) && !isRightEdge) surroundingIds.push(parseInt(id) + 1);
        if (id < (width * (width - 1) - 1) && !isLeftEdge) surroundingIds.push(parseInt(id) - 1 + width);
        if (id < (width * (width - 2) - 1) && !isRightEdge) surroundingIds.push(parseInt(id) + 1 + width);
        if (id < (width * (width - 1))) surroundingIds.push(parseInt(id) + width);

        return surroundingIds;
    }

    function addFlag(cell) {
        if (isGameOver || cell.classList.contains('revealed')) return;
        if (!cell.classList.contains('flagged')) {
            if (flags < bombCount) {
                cell.classList.add('flagged');
                flags++;
                flagsRemainingDisplay.textContent = bombCount - flags;
            }
        } else {
            cell.classList.remove('flagged');
            flags--;
            flagsRemainingDisplay.textContent = bombCount - flags;
        }
    }

    function gameOver() {
        stopTimer();
        isGameOver = true;
        statusText.textContent = 'Game Over!';
        cells.forEach(cell => {
            if (gameArray[cell.id] === 'bomb') {
                cell.classList.add('bomb');
            }
            cell.removeEventListener('click', () => click(cell));
            cell.removeEventListener('contextmenu', (e) => {
                e.preventDefault();
                addFlag(cell);
            });
        });
        updateHistory('Lost');
    }

    function checkWin() {
        const revealedCells = cells.filter(cell => cell.classList.contains('revealed'));
        if (revealedCells.length === (width * width - bombCount)) {
            stopTimer();
            statusText.textContent = 'Congratulations, You Won!';
            updateHistory('Won');
        }
    }

    function updateHistory(result) {
        if (difficultySelect.value === 'custom') return;
        const difficulty = difficultySelect.value;
        const timeFormatted = time + 's';
        gameHistory.unshift({ result, time: timeFormatted });
        if (gameHistory.length > 5) gameHistory.pop();
        historyList.innerHTML = gameHistory.map(game => `<li>${game.result} - ${game.time}</li>`).join('');

        if (bestTimes[difficulty] === null || time < parseInt(bestTimes[difficulty])) {
            bestTimes[difficulty] = timeFormatted;
            document.getElementById(`best-${difficulty}`).textContent = timeFormatted;
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function resetGame() {
        createBoard();
        startTimer();
    }

    resetButton.addEventListener('click', resetGame);
    customSettingsButton.addEventListener('click', () => {
        gridSize = parseInt(gridSizeInput.value);
        bombCount = parseInt(bombCountInput.value);
        if (gridSize < 5) gridSize = 5;
        if (bombCount < 1) bombCount = 1;
        resetGame();
    });

    createBoard(); // Initialize board on load
});
