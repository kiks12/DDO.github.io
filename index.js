
const tbody = document.getElementById('tbody');
const refreshButton = document.getElementById('refreshButton');
const scoringText = document.getElementById('scoringText');
const lostModal = document.getElementById('lostModal');
const winModal = document.getElementById('winModal');


let grid = [];
let clickedTile = undefined;
let affectedTiles = [];
// let status = 'IDLE';
let moves = 0;

const MAX_NUMBER_OF_MOVES = 100;


async function randomizeTileStates() {
    for (let i=0; i<3; i++) {
        let row = [];
        for (let j=0; j<3; j++) {
            const state = Math.floor(Math.random() * 2);
            row.push({
                name: `tile-${j}-${i}`,
                state: state === 1 ? true : false,
                coordinates: [j, i],
                neighbors: [[j, i-1], [j+1, i], [j-1, i], [j, i+1]],
            });
        }
        grid.push(row);
    }
}


async function createTiles() {
    grid.forEach((row, rowIdx) => {
        const rowElement = document.createElement('tr');
        row.forEach((col, colIdx) => {
            const tile = document.createElement('td');
            tile.classList.add(col.state ? 'active-tile' : 'inactive-tile');
            tile.id = `tile-${colIdx}-${rowIdx}`;
            tile.addEventListener('click', tileClick);
            rowElement.append(tile);
        })
        tbody.append(rowElement);
    })
}


async function addMoves() {
    moves++;
    scoringText.innerHTML = `Moves: ${moves}/${MAX_NUMBER_OF_MOVES}`;
}


async function initialize() {
    scoringText.innerHTML = `Moves: ${moves}/${MAX_NUMBER_OF_MOVES}`;
    await randomizeTileStates();
    await createTiles();
}


async function removeAllTiles() {
    let done = false; 
    let child = tbody.lastElementChild;

    while (child) {
        tbody.removeChild(child);
        child = tbody.lastElementChild;
        done = false;
    }

    done = true;

    if (done) {
        return Promise.resolve(true);
    }
}


async function resetMoves() {
    moves = 0;
    scoringText.innerHTML = `Moves: ${moves}/${MAX_NUMBER_OF_MOVES}`;
}


async function refreshGame() {
    grid = [];
    resetMoves();
    await removeAllTiles();
    await initialize();
}


async function tileClick(e) {
    const arr = e.target.id.split('-');
    const col = arr[1];
    const row = arr[2];
    const tile = grid[row][col];
    tile.state = !tile.state;

    addMoves();
    clickedTile = tile;
    affectedTiles = [];
    tile.neighbors.forEach((neighbor, idx) => {
        const [col, row] = neighbor;
        if (col < 0 || col > 2 || row < 0 || row > 2) {
            return;
        }
        neighborTile = grid[row][col];
        neighborTile.state = !neighborTile.state;
        affectedTiles.push(neighborTile);
    });
    // console.log(tile.neighbors);
}


async function handleAffectedTiles() {
    affectedTiles.forEach((affectedTile) => {
        const tile = document.getElementById(affectedTile.name);
        if (affectedTile.state) {
            tile.classList.remove('inactive-tile');
            tile.classList.add('active-tile');
        } else {
            tile.classList.remove('active-tile');
            tile.classList.add('inactive-tile');
        }
    })
}


async function gameComplete() {
    let done = false;
    for (let i=0; i<3; i++) {
        for (let j=0; j<3; j++) {
            const tile = grid[i][j];
            if (!tile.state) {
                done = false;
                break;
            } else {
                done = true;
            }
        }
        if (!done) {
            break;
        }
    }
    return done;
}


async function outOfMoves() {
    const status = await gameComplete();
    if (!status && MAX_NUMBER_OF_MOVES === moves) {
        return true;
    }
    return false;
}


async function listenToChanges() {
    if (await outOfMoves()) {
        lostModal.style.display = 'flex';
        resetMoves();
        initialize();
    }

    if (await gameComplete()) {
        console.log('win');
        winModal.style.display = 'flex';
        resetMoves();
        initialize();
    }

    if (clickedTile) {
        const clicked = document.getElementById(clickedTile.name);
        if (clickedTile.state) {
            clicked.classList.remove('inactive-tile');
            clicked.classList.add('active-tile');
        } else {
            clicked.classList.remove('active-tile');
            clicked.classList.add('inactive-tile');
        }
    }
    handleAffectedTiles();
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}


refreshButton.addEventListener('click', refreshGame);

initialize();
setInterval(listenToChanges, 10);