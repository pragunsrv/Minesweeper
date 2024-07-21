document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('minesweeper-grid');
    const statusText = document.getElementById('status-text');
    const resetButton = document.getElementById('reset-button');
    const timerDisplay = document.getElementById('timer');
    const flagsRemainingDisplay = document.getElementById('flags-remaining');
    const difficultySelect = document.getElementById('difficulty-select');
    const customSettings = document.getElementById('custom-settings');
    const gridSizeInput = document.getElementById('grid-size');
    const bombCountInput = document.getElementById('bomb-count');
    const bestEasy = document.getElementById('best-easy');
    const bestMedium = document.getElementById('best-medium');
    const bestHard = document.getElementById('best-hard');
    const historyList = document.getElementById('history-list');
    
    let width = 10;
    let bombCount = 20;
    let cells = [];
    let gameArray = [];
    let isGameOver = false;
    let flags = 0;
    let time = 0;
    let timer;
    let bestTimes = {
        easy: null,
        medium: null,
        hard: null
    };
    let gameHistory = [];

    difficultySelect.addEventListener('change', () => {
        switch (difficultySelect.value) {
            case 'easy':
                width = 10;
                bombCount = 10;
                customSettings.classList.add('hidden');
                break;
            case 'medium':
                width = 10;
                bombCount = 20;
                customSettings.classList.add('hidden');
                break;
            case 'hard':
                width = 10;
                bombCount = 30;
                customSettings.classList.add('hidden');
                break;
            case 'custom':
                customSettings.classList.remove('hidden');
                break;
        }
        createBoard();
    });

    gridSizeInput.addEventListener('input', () => {
        width = parseInt(gridSizeInput.value);
    });

    bombCountInput.addEventListener('input', () => {
        bombCount = parseInt(bombCountInput.value);
    });

    function startTimer() {
        timer = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function resetTimer() {
        time = 0;
        timerDisplay.textContent = time;
    }

    function createBoard() {
        cells = [];
        gameArray = [];
        grid.innerHTML = '';
        isGameOver = false;
        flags = 0;
        statusText.textContent = 'Game in Progress';
        flagsRemainingDisplay.textContent = bombCount;
        resetTimer();
        startTimer();

        grid.style.gridTemplateColumns = `repeat(${width}, 40px)`;

        const bombs = Array(bombCount).fill('bomb');
        const emptyCells = Array(width * width - bombCount).fill('empty');
        gameArray = emptyCells.concat(bombs).sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * width; i++) {
            const cell = document.createElement('div');
            cell.setAttribute('id', i);
            cell.classList.add('cell');
            cell.addEventListener('click', () => click(cell));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                addFlag(cell);
            });
            grid.appendChild(cell);
            cells.push(cell);
        }

        for (let i = 0; i < cells.length; i++) {
            const isLeftEdge = i % width === 0;
            const isRightEdge = i % width === width - 1;

            if (gameArray[i] === 'empty') {
                let total = 0;

                if (i > 0 && !isLeftEdge && gameArray[i - 1] === 'bomb') total++;
                if (i > 9 && !isRightEdge && gameArray[i + 1 - width] === 'bomb') total++;
                if (i > 10 && gameArray[i - width] === 'bomb') total++;
                if (i > 11 && !isLeftEdge && gameArray[i - 1 - width] === 'bomb') total++;
                if (i < 98 && !isRightEdge && gameArray[i + 1] === 'bomb') total++;
                if (i < 90 && !isLeftEdge && gameArray[i - 1 + width] === 'bomb') total++;
                if (i < 88 && !isRightEdge && gameArray[i + 1 + width] === 'bomb') total++;
                if (i < 89 && gameArray[i + width] === 'bomb') total++;

                cells[i].setAttribute('data', total);
            }
        }
    }

    function click(cell) {
        const currentId = cell.id;
        if (isGameOver || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;
        if (gameArray[currentId] === 'bomb') {
            gameOver();
            return;
        }
        cell.classList.add('revealed');
        const total = cell.getAttribute('data');
        if (total != 0) {
            cell.innerHTML = total;
            cell.classList.add(`num-${total}`);
        } else {
            cell.innerHTML = '';
            const surroundingCells = getSurroundingCells(currentId);
            surroundingCells.forEach(id => {
                const surroundingCell = cells[id];
                if (!surroundingCell.classList.contains('revealed')) {
                    click(surroundingCell);
                }
            });
        }
    }

    function getSurroundingCells(id) {
        const surrounding = [];
        const isLeftEdge = id % width === 0;
        const isRightEdge = id % width === width - 1;

        if (id > 0 && !isLeftEdge) surrounding.push(parseInt(id) - 1);
        if (id > width) surrounding.push(parseInt(id) - width);
        if (id > width && !isRightEdge) surrounding.push(parseInt(id) + 1 - width);
        if (id < (width * width) - 1 && !isRightEdge) surrounding.push(parseInt(id) + 1);
        if (id < (width * width) - width) surrounding.push(parseInt(id) + width);
        if (id < (width * width) - width && !isLeftEdge) surrounding.push(parseInt(id) - 1 + width);
        if (id < (width * width) - 1 && id > width && !isRightEdge) surrounding.push(parseInt(id) + 1 + width);
        if (id < (width * width) - width && id > 0 && !isLeftEdge) surrounding.push(parseInt(id) - 1 + width);

        return surrounding;
    }

    function addFlag(cell) {
        if (isGameOver) return;
        if (!cell.classList.contains('revealed') && (flags < bombCount)) {
            if (!cell.classList.contains('flagged')) {
                cell.classList.add('flagged');
                cell.innerHTML = '🚩';
                flags++;
            } else {
                cell.classList.remove('flagged');
                cell.innerHTML = '';
                flags--;
            }
            flagsRemainingDisplay.textContent = bombCount - flags;
            checkWin();
        }
    }

    function gameOver() {
        isGameOver = true;
        statusText.textContent = 'Game Over';
        stopTimer();
        cells.forEach(cell => {
            if (gameArray[cell.id] === 'bomb') {
                cell.classList.add('revealed');
                cell.classList.add('bomb');
                cell.innerHTML = '💣';
            }
        });
        recordGameResult('Lost');
    }

    function checkWin() {
        let matches = 0;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].classList.contains('flagged') && gameArray[i] === 'bomb') {
                matches++;
            }
            if (matches === bombCount) {
                statusText.textContent = 'You Win!';
                isGameOver = true;
                stopTimer();
                recordGameResult('Won');
            }
        }
    }

    function recordGameResult(result) {
        const difficulty = difficultySelect.value;
        const timeRecord = time;
        const bestTime = bestTimes[difficulty];
        if (bestTime === null || time < bestTime) {
            bestTimes[difficulty] = time;
            document.getElementById(`best-${difficulty}`).textContent = time;
        }
        gameHistory.unshift({ difficulty, result, time });
        if (gameHistory.length > 5) {
            gameHistory.pop();
        }
        updateHistoryList();
    }

    function updateHistoryList() {
        historyList.innerHTML = '';
        gameHistory.forEach((game, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Game ${index + 1}: ${game.difficulty.toUpperCase()} - ${game.result} in ${game.time} sec`;
            historyList.appendChild(listItem);
        });
    }

    resetButton.addEventListener('click', createBoard);

    createBoard();
});
