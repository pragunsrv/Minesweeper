document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('minesweeper-grid');
    const width = 10;
    const bombCount = 20;
    const cells = [];
    const bombs = Array(bombCount).fill('bomb');
    const emptyCells = Array(width * width - bombCount).fill('empty');
    const gameArray = emptyCells.concat(bombs).sort(() => Math.random() - 0.5);

    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const cell = document.createElement('div');
            cell.setAttribute('id', i);
            cell.classList.add('cell');
            cell.addEventListener('click', () => click(cell));
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
        if (cell.classList.contains('revealed')) return;
        cell.classList.add('revealed');

        if (gameArray[currentId] === 'bomb') {
            cell.classList.add('bomb');
            cell.innerHTML = '💣';
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

    createBoard();
});
