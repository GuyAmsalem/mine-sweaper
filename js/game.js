'use strict'
var FLAG = '🚩';
var MINE = '💣';

var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    flaggedCount: 0,
    secsPassed: 0
}
var gLevel = {
    SIZE: 4, //Create level buttons and set here.
    MINES: 2
};

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard, '.board');
}

function startGame(elCell, i, j){
    gGame.isOn = true;
    gBoard[i][j].isOpen = true;
    gGame.shownCount++;
    elCell.classList.add('clicked');
    createMines();
    setMinesNegsCount();
    elCell.innerText = gBoard[i][j].minesAroundCount;
    if (gBoard[i][j].minesAroundCount === 0) expandShown(i, j);
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn){
        startGame(elCell, i, j);
        return;
    }
    var currCell = gBoard[i][j];

    if (currCell.isFlagged) return
    if (currCell.isOpen) return;
    if (currCell.isMine) {
        gameOver();
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
        elCell.innerText = currCell.minesAroundCount;//Dom
        elCell.classList.add('clicked');
        expandShown(i, j);
    }
    if (isVictory()) {
        gameOver();
        console.log('Victorius!');
        return;
    }
}

function cellFlagged(elCell, posI, posJ) { //Try toggle 
    var cell = gBoard[posI][posJ];
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
        console.log('Victorius!');
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
                elCell.innerText = currCell.minesAroundCount;//Dom
                elCell.classList.add('clicked');
                expandShown(i, j);
            }
        }
    }
}

function isVictory() {
    var unMinedCells = gLevel.SIZE **2 - gLevel.MINES;
    // console.log('gGame.shownCount: ',gGame.shownCount);
    // console.log('unMinedCells: ',unMinedCells);
    // console.log('Flagged: ', gGame.flaggedCount);
    
    return (gGame.flaggedCount === gLevel.MINES &&
           gGame.shownCount === unMinedCells)
}

function gameOver(){
    console.log('GameOver');
    
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
            board[i][j] = createCell(i, j);
        }
    }
    return board;
}


function createCell(posI, posJ) {
    var cell = {
        isOpen: false,
        isMine: false,
        isFlagged: false,
        minesAroundCount: 0,
    }
    return cell;
}

function createMines() {
    for (let i = 0; i < gLevel.MINES; i++) {
        var mineCell = getRandomCell();
        while (mineCell.isMine || mineCell.isOpen) mineCell = getRandomCell();
        mineCell.isMine = true;
    }
}

function getRandomCell() {
    var posI = getRandomIntInclusive(0, gBoard.length - 1);
    var posJ = getRandomIntInclusive(0, gBoard.length - 1);
    var rndCell = gBoard[posI][posJ];
    return rndCell;
}

