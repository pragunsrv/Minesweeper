document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('minesweeper-grid');
    const statusText = document.getElementById('status-text');
    const resetButton = document.getElementById('reset-button');
    const timerDisplay = document.getElementById('timer');
    const flagsRemainingDisplay = document.getElementById('flags-remaining');
    const width = 10;
    const bombCount = 20;
    let cells = [];
    let gameArray = [];
    let isGameOver = false;
    let flags = 0;
    let time = 0;
    let timer;

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
        cell.classList.add('revealed');

        if (gameArray[currentId] === 'bomb') {
            cell.classList.add('bomb');
            cell.innerHTML = '💣';
            gameOver();
        } else {
            const total = cell.getAttribute('data');
            if (total != 0) {
                cell.innerHTML = total;
                return;
            }
            checkCell(cell, currentId);
        }
    }

    function checkCell(cell, currentId) {
        const isLeftEdge = currentId % width === 0;
        const isRightEdge = currentId % width === width - 1;
        setTimeout(() => {
            if (currentId > 0 && !isLeftEdge) {
                const newId = cells[parseInt(currentId) - 1].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId > 9 && !isRightEdge) {
                const newId = cells[parseInt(currentId) + 1 - width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId > 10) {
                const newId = cells[parseInt(currentId - width)].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId > 11 && !isLeftEdge) {
                const newId = cells[parseInt(currentId) - 1 - width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId < 98 && !isRightEdge) {
                const newId = cells[parseInt(currentId) + 1].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId < 90 && !isLeftEdge) {
                const newId = cells[parseInt(currentId) - 1 + width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId < 88 && !isRightEdge) {
                const newId = cells[parseInt(currentId) + 1 + width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (currentId < 89) {
                const newId = cells[parseInt(currentId) + width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
        }, 10);
    }

    function addFlag(cell) {
        if (isGameOver) return;
        if (!cell.classList.contains('revealed') && (flags < bombCount || cell.classList.contains('flagged'))) {
            if (!cell.classList.contains('flagged')) {
                cell.classList.add('flagged');
                cell.innerHTML = '🚩';
                flags++;
                flagsRemainingDisplay.textContent = bombCount - flags;
                checkWin();
            } else {
                cell.classList.remove('flagged');
                cell.innerHTML = '';
                flags--;
                flagsRemainingDisplay.textContent = bombCount - flags;
            }
        }
    }

    function gameOver() {
        isGameOver = true;
        statusText.textContent = 'Game Over!';
        stopTimer();
        cells.forEach(cell => {
            if (gameArray[cell.id] === 'bomb') {
                cell.classList.add('bomb');
                cell.innerHTML = '💣';
            }
        });
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
            }
        }
    }

    resetButton.addEventListener('click', createBoard);

    createBoard();
});
