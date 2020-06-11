// Note: This code assumes pgn4web.js is loaded and relies on variables and functions defined therein

//=========================================================== 
// Global variables
//=========================================================== 
let started = false;
let displayedGame = "";
let lastBoardWidth;
let controlPanelOption = true;

//===========================================================
// Settings
//===========================================================
SetImageType("svg");
SetImagePath("../pgn4web-3.04/images/svgchess");
// Set touch gestures (for mobile phones)
SetTouchEventEnabled(false);
// Shortcuts on the chessboard (after clicking a square)
clearShortcutSquares("abcdefgh", "12345678");
// Parameters are: delay in minutes, alertFlag (display debug messages)
SetLiveBroadcast(.25, false, false);
// Set active PGN (by default, it will be set up by the parent of the iframe)
//SetPgnUrl("pgn/old/r1.pgn");

//===========================================================
// Main part of the program
//===========================================================
function adjustBoardSize(boardWidth = undefined) {
    if (boardWidth == undefined) {
        // If no board width is given, fill the whole parent window
        let nameHeight = document.getElementById("WhiteInfo").offsetHeight;
        let cpHeight = document.getElementById("ControlPanel").offsetHeight;
        let mWidth = window.frameElement.width;
        let mHeight = window.frameElement.height - 2 * nameHeight - cpHeight;
        boardWidth = Math.min(mWidth, mHeight);
    }

    // Cancel the style for boardTable element set by pgn4web
    let boardTable = document.getElementById("boardTable");
    boardTable.style.setProperty("width", "");
    boardTable.style.setProperty("height", "");

    lastBoardWidth = boardWidth;
    let width = parseInt(boardWidth / 8);

    // Resize all the squares and pieces in the chess board
    let targetClass = ["whiteSquare", "blackSquare", "highlightWhiteSquare", "highlightBlackSquare", "pieceImage"];

    for (let i = 0; i < targetClass.length; ++i) {
        let collection = document.getElementsByClassName(targetClass[i]);
        for (let j = 0; j < collection.length; ++j) {
            collection[j].setAttribute("width", width);
            collection[j].setAttribute("height", width);
        }
    }

    // The width of the game board is 8 * fit, and the borders are 2 additional pixels
    document.getElementById("Miniboard").setAttribute("style", "width: " + String(width * 8 + 2) + "px;");
}

function messageToParent(msg) {
    // Send a message to the parent element
    // Target is specified and checked for security purposes    
    let target = location.protocol + "//" + location.hostname +
        (location.port.length > 0 ? ":" + location.port : "");
    parent.postMessage(msg, target);
}

function changePgn(pgnUrl) {
    // Change round file (PGN) for the miniboard
    SetInitialHalfmove("end", true);
    SetPgnUrl(pgnUrl);

    // Restart live broadcast
    LiveBroadcastLastModified = (new Date(0));
    LiveBroadcastLastModifiedHeader = LiveBroadcastLastModified.toUTCString();
    restartLiveBroadcast();
}

function customFunctionOnPgnTextLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN

    // Frame id's are 'frame0', 'frame1' etc.
    let ind = window.frameElement.id.substr(5);
    // In the <iframe> #ind, open the game #ind
    // In other words, in the <iframe>s, the first games of the PGN file will be displayed
    Init(ind);

    // The first iframe sends a message after changing round file (PGN)
    //   so that the select modal can be updated accordingly
    if (ind == "0") {
        messageToParent("PgnTextLoaded");
    }
}

function customFunctionOnPgnGameLoad() {
    // Overriding the function from pgn4web.js that will run after loading a game

    if (!started) {
        started = true;
        displayedGame = getDisplayedMinigame();
        adjustBoardSize(lastBoardWidth);
        // Inform the parent that the page is loaded
        messageToParent(window.frameElement.id + "Ready");
    }

    let resultElem = document.getElementById("GameResult");
    let resultW = document.getElementById("ResultWhite");
    let resultB = document.getElementById("ResultBlack");
    if (resultElem.innerHTML == "1/2-1/2") {
        resultW.innerHTML = resultB.innerHTML = "½";
    }
    else if (["1-0", "0-1"].includes(resultElem.innerHTML)) {
        resultW.innerHTML = resultElem.innerHTML[0];
        resultB.innerHTML = resultElem.innerHTML[2];
    }
    else {
        resultW.innerHTML = resultB.innerHTML = "‎&lrm;";
    }

    // Rotate back, if the board was rotated and a new game is loaded
    if (IsRotated && getDisplayedMinigame() != displayedGame) {
        flipMiniboard();
    }

    displayedGame = getDisplayedMinigame();
}

function getDisplayedMinigame() {
    return gameWhite[currentGame] + " - " + gameBlack[currentGame] + ", "
        + (gameDate.length ? gameDate[currentGame] : "");
}

function flipMiniboard() {
    let wInfo = document.getElementById("WhiteInfo");
    let bInfo = document.getElementById("BlackInfo");
    let board = document.getElementById("GameBoard");

    wInfo.parentNode.insertBefore(bInfo, wInfo);
    if (IsRotated) {
        wInfo.parentNode.insertBefore(board, wInfo);
    }
    else {
        board.parentNode.insertBefore(wInfo, board);
    }

    FlipBoard();
    adjustBoardSize(lastBoardWidth);
}

function toggleControlPanel() {
    controlPanelOption = !controlPanelOption;

    let panel = document.getElementById("ControlPanel");
    if (!controlPanelOption) {
        panel.style.display = "none";
    }
    else {
        panel.style.display = "";
    }
}

function toggleHighlight() {
    SetHighlight(!highlightOption);
}
