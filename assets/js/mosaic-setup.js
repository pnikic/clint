// Note: This code assumes pgn4web.js is loaded and relies on variables and functions defined therein

//=========================================================== 
// Global variables
//=========================================================== 
let started = false;
let displayedGame = "";

//===========================================================
// Settings
//===========================================================
// Adjust the size of a miniboard
adjustBoardSize(300);
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
function adjustBoardSize(boardWidth) {
    // The piece images are defined in the following sizes (see /images subfolders in pgn4web-x.yz)
    let squareSizes = [300, 144, 128, 112, 96, 88, 80, 72, 64, 60,
                       56, 52, 48, 47, 46, 45, 44, 43, 42, 41, 40,
                       39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29,
                       28, 27, 26, 25, 24, 23, 22, 21, 20];
    let fit = squareSizes.find(x => x < boardWidth / 8);
    if (!fit)
        fit = squareSizes[squareSizes.length - 1];

    document.getElementById("Miniboard").setAttribute("style", "width: " + String(fit * 8 + 2) + "px;");
    SetImagePath("../pgn4web-3.04/images/alpha/" + String(fit));
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
        displayedGame = getDisplayedMinigame();
        started = true;
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
        resultW.innerHTML = resultB.innerHTML = "*";
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
}

function toggleControlPanel() {
    let panel = document.getElementById("ControlPanel");
    if (panel.style.display == "") {
        panel.style.display = "none";
    }
    else {
        panel.style.display = "";
    }
}

function toggleHighlight() {
    SetHighlight(!highlightOption);
}

// At the end of the script, inform the parent that the page is loaded
messageToParent(window.frameElement.id + "Ready");
