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
// pgn4web settings are configured in config.js

// Turn off control panel
toggleControlPanel();

//===========================================================
// Main part of the program
//===========================================================
function adjustBoardSize(boardWidth = undefined) {
    if (boardWidth == undefined) {
        // If no board width is given, fill the whole parent window
        let nameHeight = document.getElementById("MiniboardWhiteInfo").offsetHeight;
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
    let targetClass = ["whiteSquare", "blackSquare", "highlightWhiteSquare", "highlightBlackSquare",
                       "pieceImage"];

    for (let i = 0; i < targetClass.length; ++i) {
        let collection = document.getElementsByClassName(targetClass[i]);
        for (let j = 0; j < collection.length; ++j) {
            collection[j].setAttribute("width", width);
            collection[j].setAttribute("height", width);
        }
    }

    // The width of the game board is 8 * fit, and the borders are 2 additional pixels
    document.getElementById("Miniboard")
            .setAttribute("style", "width: " + String(width * 8 + 2) + "px;");
}

function messageToParent(msg) {
    // Send a message to the parent element
    // Target is specified and checked for security purposes
    let target = location.protocol + "//" + location.hostname +
        (location.port.length > 0 ? ":" + location.port : "");
    parent.postMessage(msg, target);
}

function changeGame(ind) {
    Init(ind);
    displayedGame = getDisplayedMinigame();
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

    // Frame id's are 'Frame0', 'Frame1' etc.
    let ind = window.frameElement.id.substr(5);

    // In case of loading the same PGN file (new moves coming), perform no action. Otherwise, in
    //   case of loading a different PGN file, load the games from the top of the file, i.e.
    //   in the i-th <iframe>, open the i-th game. This is implemented using `setTimeout` so that
    //   pgn4web's caller of `customFunctionOnPgnTextLoad` is released
    if (getDisplayedMinigame() != displayedGame) {
        setTimeout(() => {
            Init(ind);
        }, 0);
    }

    // The first iframe sends a message after changing round file (PGN) so that the game selection
    //   modal can be updated accordingly
    if (ind == "0") {
        if (getDisplayedMinigame() != displayedGame)
            messageToParent("PgnTextLoadedNewGame");
        else
            messageToParent("PgnTextLoaded");
    }

    displayedGame = getDisplayedMinigame();
}

function customFunctionOnPgnGameLoad() {
    // Overriding the function from pgn4web.js that will run after loading a game

    if (!started) {
        started = true;
        adjustBoardSize(lastBoardWidth);

        // Inform the parent that the page is loaded, so that the first PGN file can be loaded
        if (window.frameElement)
            messageToParent(window.frameElement.id + "Ready");
    }

    updateResult();

    // Rotate back, if the board was rotated and a new game is loaded
    if (IsRotated && getDisplayedMinigame() != displayedGame) {
        flipMiniboard();
    }

    // Start clock countdown if enabled
    if (clockCountdownEnabled) {
        // Get reference time from pgn
        referenceTime = customPgnHeaderTag("ReferenceTime");

        // Remove `clockActive` if set from previous game
        document.getElementById("MiniboardBlackClock").classList.remove("clockActive");
        document.getElementById("MiniboardWhiteClock").classList.remove("clockActive");

        if (clockCountdownTimer) {
            clearInterval(clockCountdownTimer);
            clockCountdownTimer = undefined;
        }

        checkLiveBroadcastStatus();

        if (LiveBroadcastGamesRunning > 0 && gameResult[currentGame] === '*'
            && CurrentPly === PlyNumber) {
            clockCountdown(true);
            clockCountdownTimer = setInterval(clockCountdown, 1000, false);
        }
    }
}

function getDisplayedMinigame() {
    return gameWhite[currentGame] + " - " + gameBlack[currentGame] + ", "
        + (gameDate.length ? gameDate[currentGame] : "");
}

function flipMiniboard() {
    const wInfo = document.getElementById("MiniboardWhiteInfo");
    const bInfo = document.getElementById("MiniboardBlackInfo");
    const board = document.getElementById("GameBoard");

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
