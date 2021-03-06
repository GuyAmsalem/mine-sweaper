'use strict'

var FLAG = '🚩';
var MINE = '💣';
var NORMAL = '🙂';
var LOSE = '😵';
var WIN = '😎';

var gGameInterval;
var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    flaggedCount: 0,
    secsPassed: 0,
    hints: 3,
    hintMode: false,
    lives: 3,
    safeClicks: 3
};
var gLevel = {
    SIZE: 8,
    MINES: 12
};

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard, '.board');
    initBestScore();
}

function safeClick() {
    if (gGame.safeClicks > 0) {
        gGame.safeClicks--;
        document.querySelector('.clicks').innerText = gGame.safeClicks;
        var cellIdx = getMatRndIdx(gBoard);
        var cell = gBoard[cellIdx.i][cellIdx.j];
        while (cell.isOpen || cell.isMine) {
            var cellIdx = getMatRndIdx(gBoard);
            var cell = gBoard[cellIdx.i][cellIdx.j];
        }
        var elCell = document.querySelector('.' + getClassName(cellIdx));
        elCell.classList.add('flashing');
        if (cell.minesAroundCount > 0) {
            elCell.innerText = cell.minesAroundCount;
        } else {
            elCell.innerText = '';
        }
        setTimeout(() => {
            elCell.classList.remove('flashing');
            if (cell.isOpen) return;
            elCell.innerText = '';
        }, 2000);
    } else {
        alert('You have used all the safe clicks.')
    }
}

function changeLevel(elLevel) {
    gLevel.SIZE = + elLevel.dataset.size;
    gLevel.MINES = + elLevel.dataset.mines;
    startOver();
}

function resetGame() {
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.flaggedCount = 0;
    gGame.secsPassed = 0;
    gGame.hints = 3;
    gGame.hintMode = false;
    gGame.lives = 3;
    gGame.safeClicks = 3;
    gGameInterval = null;
    document.querySelector('.emojy').innerText = NORMAL;
    document.querySelector('.timer').innerText = 0;
    document.querySelector('.hint').innerText = '💡💡💡';
    document.querySelector('.clicks').innerText = gGame.safeClicks;
    document.querySelector('.lives').innerText = '💖💖💖';
}

function startGame(elCell, i, j) {
    startTimer();
    gGame.isOn = true;
    gBoard[i][j].isOpen = true;
    gGame.shownCount++;
    elCell.classList.add('clicked');
    if (gBoard[i][j].minesAroundCount > 0) {
        elCell.innerText = gBoard[i][j].minesAroundCount;
    } else {
        elCell.innerText = '';
    }
    createMines(i, j);
    setMinesNegsCount();
    if (gBoard[i][j].minesAroundCount === 0) expandShown(i, j);
}

function startTimer() {
    gGameInterval = setInterval(() => {
        gGame.secsPassed++
        var elTimer = document.querySelector('.timer');
        elTimer.innerText = gGame.secsPassed;
    }, 1000);
}

function startOver() {
    clearInterval(gGameInterval);
    resetGame();
    initGame();
}

function gameOver() {
    clearInterval(gGameInterval);
    showBoard();
    if (isVictory()) {
        document.querySelector('.emojy').innerText = WIN;
    } else {
        document.querySelector('.emojy').innerText = LOSE;
    }
}

function showBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j];
            cell.isOpen = true; //Model
            var location = { i: i, j: j }
            var elCell = document.querySelector('.' + getClassName(location)); //Dom
            elCell.classList.add('clicked');
            if (cell.isMine) {
                elCell.innerText = MINE;
                elCell.classList.add('mine');
            }
            else if (cell.minesAroundCount > 0) {
                elCell.innerText = cell.minesAroundCount;
            } else {
                elCell.innerText = '';
            }
        }
    }
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) { //first click
        startGame(elCell, i, j);
        return;
    } else if (gGame.hintMode) {
        flashHintBoard(i, j);
        return;
    }
    var currCell = gBoard[i][j];

    if (currCell.isFlagged) return
    if (currCell.isOpen) return;
    if (currCell.isMine) {
        gGame.lives--;
        document.querySelector('.lives').innerText = getStrLives();

        currCell.isOpen = true;
        if (isVictory()) {
            gameOver();
            return;
        }
        if (gGame.lives >= 0) {
            document.querySelector('.lives').innerText = getStrLives();
            elCell.innerText = MINE;
            elCell.classList.add('mine');
        } else {
            gameOver();
        }
        return;
    }
    if (currCell.minesAroundCount > 0) {
        currCell.isOpen = true; //Model
        gGame.shownCount++;
        elCell.innerText = currCell.minesAroundCount;//Dom
        elCell.classList.add('clicked');
    } else {
        currCell.isOpen = true;//Model
        gGame.shownCount++;
        elCell.innerText = '';//Dom
        elCell.classList.add('clicked');
        expandShown(i, j);
    }
    if (isVictory()) {
        gameOver();
        return;
    }
}

function cellFlagged(elCell, posI, posJ) {
    var cell = gBoard[posI][posJ];
    if (cell.isOpen) return;
    if (cell.isFlagged) {
        cell.isFlagged = false;
        gGame.flaggedCount--;
        elCell.innerText = '';
    } else {
        cell.isFlagged = true;
        gGame.flaggedCount++;
        elCell.innerText = FLAG;
    }
    if (isVictory()) {
        gameOver();
        return;
    }
}

function expandShown(posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === posI && j === posJ) continue;

            var location = { i: i, j: j }
            var elCell = document.querySelector('.' + getClassName(location));
            var currCell = gBoard[i][j];
            if (currCell.isMine || currCell.isFlagged || currCell.isOpen) continue;
            if (currCell.minesAroundCount > 0) {
                currCell.isOpen = true; //Model
                gGame.shownCount++;
                elCell.innerText = currCell.minesAroundCount;//Dom
                elCell.classList.add('clicked');
            } else {
                currCell.isOpen = true;//Model
                gGame.shownCount++;
                elCell.innerText = '';//Dom
                elCell.classList.add('clicked');
                expandShown(i, j);
            }
        }
    }
}

function isVictory() {
    var unMinedCells = gLevel.SIZE ** 2 - gLevel.MINES;
    var explodedMines = 3 - gGame.lives;
    if (explodedMines === gLevel.MINES) {
        setBestScore();
        return true;
    } else if (explodedMines + gGame.flaggedCount === gLevel.MINES && //counting also exploded mines
        gGame.shownCount === unMinedCells) {
        setBestScore();
        return true;
    } else {
        return false;
    }
}

function getStrLives() {
    var strLives = ''
    for (var i = 0; i < gGame.lives; i++) {
        strLives += '💖'
    }
    return strLives;
}
function initBestScore() {
    if (!localStorage.getItem('begginer')) {
        document.querySelector('.begginer').innerText = 'Not Yet';
    } else {
        document.querySelector('.begginer').innerText = localStorage.getItem('begginer') + 's';
    }
    if (!localStorage.getItem('medium')) {
        document.querySelector('.medium').innerText = 'Not Yet';
    } else {
        document.querySelector('.medium').innerText = localStorage.getItem('medium') + 's';
    }
    if (!localStorage.getItem('extreme')) {
        document.querySelector('.extreme').innerText = 'Not Yet';
    } else {
        document.querySelector('.extreme').innerText = localStorage.getItem('extreme') +'s';
    }
}

function setBestScore() {
    var level = (gLevel.SIZE === 4) ? 'begginer' : (gLevel.SIZE === 8) ? 'medium' : 'extreme';
    if (!localStorage.getItem(level) ||
        gGame.secsPassed < localStorage.getItem(level)) {
        localStorage.setItem(level, gGame.secsPassed);
        document.querySelector('.' + level).innerText = gGame.secsPassed + 's';
    }
}

function setMinesNegsCount() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            var minedNegs = getMinesNegsCount(i, j)
            currCell.minesAroundCount = minedNegs;
        }
    }
}

function getMinesNegsCount(posI, posJ) {
    var minedNegsCount = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === posI && j === posJ) continue;
            if (gBoard[i][j].isMine) minedNegsCount++
        }
    }
    return minedNegsCount;
}

function buildBoard() {
    var SIZE = gLevel.SIZE;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = createCell();
        }
    }
    return board;
}

function createCell() { 
    var cell = {
        isOpen: false,
        isMine: false,
        isFlagged: false,
        minesAroundCount: 0,
    }
    return cell;
}

function createMines(posI, posJ) {
    for (let i = 0; i < gLevel.MINES; i++) {
        var cellIdx = getMatRndIdx(gBoard);
        while (gBoard[cellIdx.i][cellIdx.j].isMine ||
            gBoard[cellIdx.i][cellIdx.j].isOpen ||
            Math.abs(posI - cellIdx.i) < 2 && Math.abs(posJ - cellIdx.j) < 2) { //first click free 
            cellIdx = getMatRndIdx(gBoard);
        }
        gBoard[cellIdx.i][cellIdx.j].isMine = true;
    }
}

function startHintMode(elHint) {
    if (gGame.hints === 1) {
        elHint.innerText = '🚫';
        gGame.hintMode = true;
        gGame.hints--;
    } else if (gGame.hints > 0) {
        if (!gGame.isOn) return;
        gGame.hintMode = true;
        gGame.hints--;
        var strHint = '';
        for (var i = 0; i < gGame.hints; i++) {
            strHint += '💡';
        }
        elHint.innerText = strHint;
    }
}

function flashHintBoard(posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].isOpen) continue;
            var cell = gBoard[i][j];
            var location = { i: i, j: j }
            var elCell = document.querySelector('.' + getClassName(location));
            elCell.classList.add('flashing');
            if (cell.isMine) elCell.innerText = MINE;
            else if (cell.minesAroundCount > 0) {
                elCell.innerText = cell.minesAroundCount;
            } else {
                elCell.innerText = '';
            }
        }
    }
    setTimeout(() => {
        clearHintBoard(posI, posJ);
    }, 1000);
}

function clearHintBoard(posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].isOpen) continue;
            var cell = gBoard[i][j];
            var location = { i: i, j: j }
            var elCell = document.querySelector('.' + getClassName(location));
            elCell.classList.remove('flashing');
            elCell.innerText = (cell.isFlagged) ? FLAG : '';
            gGame.hintMode = false;
        }
    }
}