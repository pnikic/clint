// Note: This code assumes pgn4web.js is loaded and relies on variables and functions defined therein

//=========================================================== 
// Global variables
//=========================================================== 
let allPGNs = [];          // Array of PGN files to be filled
let started = false;       // Boolean indicating whether a PGN file was loaded once
let displayedGame = "";    // Currently displayed game

//=========================================================== 
// Settings
//===========================================================
//----------------------------------------------------------
// Single board view
//----------------------------------------------------------
// Path to /images folder of pgn4web
SetImagePath("../pgn4web-3.04/images");
// Set delay for autoplay of the game (in milliseconds)
SetAutoplayDelay(1000);
// Set starting value for move highlighting
SetHighlightOption(true);
// Set touch gestures (for mobile phones)
SetTouchEventEnabled(false);
// Shortcuts on the chessboard (after clicking a square)
clearShortcutSquares("abcdefgh", "12345678");
// Parameters are: delay in minutes, alertFlag (display debug messages)
SetLiveBroadcast(.25, false);
// Set the game on first or last move based on first argument: "start" or "end".
// This function call is only relevant for startup. Otherwise check the changePGN(...) function
SetInitialHalfmove("end", true);
// Number of minutes before round for enabling current round selection
let minsBeforeRound = 45;

//----------------------------------------------------------
// Multiple boards view
//----------------------------------------------------------
let numberMiniboards = 6;
let miniboardWidth = 330;
let miniboardHeight = 410;

//=========================================================== 
// Information about rounds and tournament
//=========================================================== 
SetPgnUrl("pgn/r1.pgn"); // Active PGN (current round)

function operatorSettings() {
    // Define starting time and PGN files for all rounds
    let roundsInfo = [];

    // Every element is of format:
    //  [ [year, month, day, hours, minutes], path/to/pgn ]
    roundsInfo.push([[2020, 4, 11, 13, 00], "pgn/r1.pgn"]);
    roundsInfo.push([[2020, 4, 12, 16, 00], "pgn/r2.pgn"]);
    roundsInfo.push([[2020, 4, 13, 16, 00], "pgn/r3.pgn"]);
    roundsInfo.push([[2020, 4, 14, 09, 30], "pgn/r4.pgn"]);
    generateAllPGNs(roundsInfo);

    // Additional PGN files
    allPGNs.push(["Arhiva", "pgn/all.pgn"]);

    // PGN download buttons
    document.getElementById("currLink").href = pgnUrl;         // current active pgn
    document.getElementById("allLink").href = "pgn/all.pgn";   // all rounds
    // Link for chess-results
    document.getElementById("ChessResultLink").href = "https://chess-results.com/";
    // Link for photo gallery
    document.getElementById("PhotoLink").href = "https://www.example.com";
    // Link for tournament details (can be a link to a local file)
    document.getElementById("Raspis").href = "https://www.example.com";
    // Paragraph for operator
    document.getElementById("OperatorPar").innerHTML = "operater: " + "&lt; ime operatera &gt;";
}

//=========================================================== 
// Main part of the program
//===========================================================
function pad(str, totalChars, padChar) {
    return (totalChars > str.length ? String(padChar).repeat(totalChars - str.length) : "") +  str;
}

function dateToString(date) {
    return String(date.getDate() + "/" + String(date.getMonth() + 1)) + "/" + String(date.getFullYear())
        + " " + pad(String(date.getHours()), 2, "0") + ":" + pad(String(date.getMinutes()), 2, "0");
}

function generateAllPGNs(roundsInfo) {
    for (let i = 0; i < roundsInfo.length; ++i) {
        let fst = roundsInfo[i][0];
        let date = new Date(fst[0], fst[1] - 1, fst[2], fst[3], fst[4]);
        let roundName = String(i + 1) + ". kolo - " + dateToString(date);
        allPGNs.push([roundName, roundsInfo[i][1], date]);
    }
}

function customFunctionOnPgnGameLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN
    
    if (!started) {
        // Code in this block exectues only once

        // Set up hyperlinks, PGN files etc.
        operatorSettings();

        // Set up round select menu (for single- and multi-board view)
        let selectRoundElem = document.getElementById("PgnFileSelect");
        let mbSelectRoundElem = document.getElementById("MultiboardFileSelect");
        let now = new Date();

        for (let i = 0; i < allPGNs.length; ++i){
            let option = document.createElement("option");
            option.value = String(i);
            option.innerHTML = allPGNs[i][0];
            // If the round will start at later point in time, disable its selection
            if (allPGNs[i].length > 2 && new Date(allPGNs[i][2].getTime() - minsBeforeRound * 60000) > now) {
                option.disabled = true;
            }

            selectRoundElem.appendChild(option);
            mbSelectRoundElem.appendChild(option.cloneNode(true));
        }

        changePGN(-1); // This actually (re)starts live broadcast
        displayedGame = getDisplayedGame();
        started = true;
    }

    adjustSquareSize();

    // Add Elo ratings
    customPgnHeaderTag("WhiteElo", "GameWhiteRating");
    customPgnHeaderTag("BlackElo", "GameBlackRating");

    // For players without rating, set a dash
    let whiteRat = document.getElementById("GameWhiteRating");
    let blackRat = document.getElementById("GameBlackRating");
    if (whiteRat.innerHTML == "0") {
        whiteRat.innerHTML = "-";
    }

    if (blackRat.innerHTML == "0") {
        blackRat.innerHTML = "-";
    }

    adjustDrawSign();

    // If a new game is loaded and the board was rotated, rotate back
    // After loading a new game, white will always be on bottom
    if (IsRotated && getDisplayedGame() != displayedGame) {
        flipBoard();
    }

    displayedGame = getDisplayedGame();
}

function adjustDrawSign() {
    let resultElem = document.getElementById("GameResult");
    if (resultElem.innerHTML == "1/2-1/2") {
        resultElem.innerHTML = "½-½";
    }
}

function getDisplayedGame() {
    // Returns an (almost) unique identifer of a chess game
    return gameWhite[currentGame] + " - " + gameBlack[currentGame] + ", "
        + (gameDate.length ? gameDate[currentGame] : "");
}

function adjustSquareSize(scale = 1) {
    // Set up square sizes, and height/width of game and engine evaluation texts,
    //  according to the screen size
    let boardWidth = scale * document.getElementById("GameBoard").clientWidth;
    let width = String(Math.floor(boardWidth / 8));

    ws = document.getElementsByClassName("whiteSquare");
    bs = document.getElementsByClassName("blackSquare");
    ps = document.getElementsByClassName("pieceImage");

    for (i = 0; i < ws.length; ++i){
        ws[i].setAttribute("width", width);
        ws[i].setAttribute("height", width);
    }

    for (i = 0; i < bs.length; ++i){
        bs[i].setAttribute("width", width);
        bs[i].setAttribute("height", width);
    }

    for (i = 0; i < ps.length; ++i){
        ps[i].setAttribute("width", width);
        ps[i].setAttribute("height", width);
    }

    // Set height/width of game text divs and engine evaluation divs
    let gtDiv = document.getElementById("GameTextDiv");
    let gt = document.getElementById("GameText");
    gtDiv.style.setProperty("height", "100%");
    let movesWidth = String(Math.floor(0.575 * gtDiv.clientWidth))
    gt.style.setProperty("height", "85%");
    gt.style.setProperty("width", movesWidth + "px");
    gt.style.setProperty("max-height", String(boardWidth) + "px");

    let engineDiv = document.getElementById("EngineEvalDiv");
    let engineLineDiv = document.getElementById("EngineVariationDiv");
    
    // https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device
    let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches || window.innerWidth < 960;
    if (!isMobile) {
        engineLineDiv.style.setProperty("width", movesWidth + "px");
        engineDiv.style.setProperty("width", movesWidth + "px");
    }
    else {
        engineLineDiv.style.setProperty("width", "");
        engineDiv.style.setProperty("width", "");
    }
}

function customFunctionOnMove() {
    // Overriding the function from pgn4web.js that will run after each move

    // If there is no information about the clock, display a dash
    let clockElemW = document.getElementById("GameWhiteClock");
    let clockElemB = document.getElementById("GameBlackClock");
    if (clockElemW.innerHTML.length < 1)
        clockElemW.innerHTML = "-";
    if (clockElemB.innerHTML.length < 1)
        clockElemB.innerHTML = "-";

    // Highlight current move in PGN window
    let highlightedMoveId = "Var0Mv" + String(CurrentPly);
    let currMove = document.getElementById(highlightedMoveId);
    if (currMove)
        currMove.classList.add("highlightMove");

    // Scroll game text to current move
    let gt = document.getElementById("GameText");
    let scrollSize = Math.max(0, gt.scrollHeight * CurrentPly / Moves.length - gt.offsetHeight / 2);
    gt.scrollTop = parseInt(scrollSize);

    // Update engine evaluation
    useEngine();

    // Update autoplay button (e.g. in case of clicking on move in PGN window)
    document.getElementById("AutoPlayBtn").innerHTML = isAutoPlayOn ? "⏸" : "▶";
}

function changePGN(val) {
    // Callback for the "select round" menu in single board view
    val = Number(val); 
    let arg = "end"  // "start" or "end"

    if (val >= 0 && val < allPGNs.length) {
        // Set the game on first or last move based on first argument
        SetInitialHalfmove(arg, true); 
        // Scroll game text to the bottom
        let gt = document.getElementById("GameText");
        gt.scrollTop = arg == "end" ? gt.scrollHeight : 0;
        
        SetPgnUrl(allPGNs[val][1]);
        document.getElementById("currLink").href = pgnUrl;
    }

    restartBroadcast()
}

function modalOpen() {
    // Refres FEN and PGN values in the "share" modal
    let elemFEN = document.getElementById("FENinput");
    elemFEN.value = CurrentFEN();

    let elemPGN = document.getElementById("PGNinput");
    elemPGN.value = fullPgnGame(currentGame);
}

function copyInput(element) {
    // Copy element content to clipboard
    let elem = document.getElementById(element);
    elem.select();
    elem.setSelectionRange(0, 99999); // Mobile phones
    document.execCommand("copy");
}

function flipBoard() {
    // Wrapping the pgn4web's FlipBoard() function, to also change the position
    //  of player's informations (name, rating, clock, colored square)

    // Flip colored square places
    let wsn = document.getElementById('WhiteSquareName');
    let bsn = document.getElementById('BlackSquareName');
    document.getElementById('ColorSquarePlace1').appendChild(IsRotated ? bsn : wsn);
    document.getElementById('ColorSquarePlace2').appendChild(IsRotated ? wsn : bsn);

    // Flip rating places
    let ratB = document.getElementById("GameBlackRating");
    let ratW = document.getElementById("GameWhiteRating");
    document.getElementById('RatingPlace1').appendChild(IsRotated ? ratB : ratW);
    document.getElementById('RatingPlace2').appendChild(IsRotated ? ratW : ratB);

    // Flip player names places
    let nameB = document.getElementById("GameBlack");
    let nameW = document.getElementById("GameWhite");
    document.getElementById('PlayerPlace1').appendChild(IsRotated ? nameB : nameW);
    document.getElementById('PlayerPlace2').appendChild(IsRotated ? nameW : nameB);

    // Flip clock places
    let clkB = document.getElementById("GameBlackClock");
    let clkW = document.getElementById("GameWhiteClock");
    document.getElementById('ClockPlace1').appendChild(IsRotated ? clkB : clkW);
    document.getElementById('ClockPlace2').appendChild(IsRotated ? clkW : clkB);

    FlipBoard();  // This function call will refresh all the default tags (GameWhite, GameWhiteClock etc)...
    adjustSquareSize(); // ...and also mess up with piece image sizes, so we resize them
    adjustDrawSign();
}

//=========================================================== 
// Engine
//===========================================================

// Engine global variables
let engine;
let toMove;
let engineStatus = 0;
let icons = ["assets/images/toggleButton.png",   // OFF
             "assets/images/toggleButton1.png"]; // ON

function initializeEngine() {
    engine = new Worker("assets/js/stockfish.js");
    
    // Callback from engine 
    engine.onmessage = function onmessage(event) {
        let msg = event.data;

        // Evaluation message from engine
        if (msg.indexOf("info depth") !== -1 &&
            msg.indexOf("lowerbound") == -1  &&
            msg.indexOf("upperbound") == -1) {
            tokens = msg.split(" ");

            // Reconstruct variation
            let game = new Chess(CurrentFEN());
            let moves = "";
            for (let i = tokens.indexOf("pv") + 1; i < tokens.length; ++i) {
                let move = tokens[i];
                try {
                    // Get move number
                    let FENtokens = game.fen().split(" ");
                    let mvNum = FENtokens[FENtokens.length - 1]
                    // Simulate the move and get SAN
                    let san = game.move({from: move.substring(0,2), to: move.substring(2,4), promotion:move.substring(4)}).san;

                    // If black is to have the first move in the variation
                    if (moves == "" && game.turn() == "w")
                        moves += mvNum + "... ";

                    // We check if it is black to move, because a move was just played with the game.move(...) function call
                    moves += (game.turn() == "b" ? mvNum + ". " : "") + san + " ";
                }
                catch(e) {
                    // Game has changed in the meantime, and the current FEN does not correspond to the moves received in this event
                    return;
                }
            }

            // Score and depth
            let depth = tokens[2];
            let score;

            // Checkmate
            if (msg.indexOf("mate") !== -1) {
                score = Number(tokens[tokens.indexOf("mate") + 1]);
            }
            // Centipawn loss (from engine's point of view)
            else {
                score = Number(tokens[tokens.indexOf("cp") + 1]) / 100;
            }

            if (toMove === "black")
                score *= -1;

            score = String(score);

            if (msg.indexOf("mate") !== -1) {
                score = "#" + score;
            }

            setEngineAnnotations(moves, "Dubina: " + depth, score);
        }
    };
}

function setEngineAnnotations(line, depth, score) {
    if (!engineStatus)
        line = depth = score = "";

    document.getElementById("EngineVariationDiv").innerHTML = line;
    document.getElementById("Depth").innerHTML = depth;
    document.getElementById("Score").innerHTML = score;
}


function useEngine() {
    if (!engine) {
        return "";
    }

    // Stop previous calculations and evaluate new position
    engine.postMessage("stop");
    setEngineAnnotations("Učitavanje...", "", "...");

    if (engineStatus) {
        // Analyze current position
        engine.postMessage("position fen " + CurrentFEN());
        // Get current side to move, so that engine lines can be displayed correctly
        toMove = document.getElementById("GameSideToMove").innerHTML;
        engine.postMessage("go depth 21");
    }
}

function toggleEngine() {
    engineStatus = Number(!engineStatus);
    document.getElementById("engineToggleIcon").src = icons[engineStatus];

    if (engineStatus && !engine)
        initializeEngine();

    let variationDiv = document.getElementById("EngineVariationDiv");
    if (engineStatus) {
        variationDiv.style.display = "block";
    }
    else {
        variationDiv.style.display = "none";
        setEngineAnnotations("", "", "");
    }

    useEngine();
}


//=========================================================== 
// Miscellaneous settings
//===========================================================

// Overriding the function from from pgn4web.js, in order to enable only selected shortcuts
// The following code is adapted from the original function
function pgn4web_handleKey(e) {
    if (!e) {
        e = window.event;
    }

    if (e.altKey || e.ctrlKey || e.metaKey) {
        return true;
    }

    keycode = e.keyCode;

    switch (keycode) {
    case 37: // left-arrow
        backButton(e);
        break;

    case 38: // up-arrow
        startButton(e);
        break;

    case 39: // right-arrow
        forwardButton(e);
        break;

    case 40: // down-arrow
        endButton(e);
        break;

    case 86: // v
        if (numberOfGames > 1) { Init(0); }
        break;

    case 66: // b
        Init(currentGame - 1);
        break;

    case 78: // n
        Init(currentGame + 1);
        break;

    case 77: // m
        if (numberOfGames > 1) { Init(numberOfGames - 1); }
        break;

    default:
        return true;
    }

    return stopEvProp(e);
}

function snackbarMessage(msg) {
    let sb = document.getElementById('Snackbar');
    sb.innerHTML = msg;
    sb.className = "show";
    setTimeout(function(){
        sb.className = sb.className.replace("show", "");
        sb.innerHTML = '';
    }, 3000);
}

function toggleAutoplay() {
    if (CurrentPly == PlyNumber)
        return;

    document.getElementById("AutoPlayBtn").innerHTML = isAutoPlayOn ? "▶" : "⏸";
    SetAutoPlay(!isAutoPlayOn);
}

function customFunctionOnPgnTextLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN

    // Update of options in "select game" menu
    let gameSel = document.getElementById("GameSelectMenu");

    // Delete all options except the first (name of the menu)
    while (gameSel.childElementCount > 1) {
        gameSel.removeChild(gameSel.lastChild);
    }

    // (Re)generate the game selection menu
    for (let i = 0; i < numberOfGames; ++i) {
        option = document.createElement("option");
        option.value = String(i);
        option.innerHTML = gameWhite[i] + " - " + gameBlack[i];;
        gameSel.appendChild(option);
    }
}

function changeGame(ind) {
    // Callback for the "select game" menu in single board view
    Init(ind);
}

function restartBroadcast() {
    LiveBroadcastLastModified = (new Date(0));
    LiveBroadcastLastModifiedHeader = LiveBroadcastLastModified.toUTCString();
    restartLiveBroadcast();
}

//===========================================================
// Multiple board view setup
//===========================================================
let iframesGenerated = false;
let iframesLoaded = Array(numberMiniboards).fill(0);

// Array of displayed games, used for choose games modal
// By default, the first games are loaded
let chosenGames = Array(numberMiniboards);
for (let i = 0; i < numberMiniboards; ++i) {
    chosenGames[i] = i;
}

function generateIframes() {
    // Generate the <iframe> elements
    let iframesDiv = document.getElementById("IframesContainer");
    for (let i = 0; i < numberMiniboards; ++i) {
        let frame = document.createElement("iframe");
        frame.id = "frame" + String(i);
        frame.width = String(miniboardWidth);
        frame.height = String(miniboardHeight);
        frame.src = "mosaic-tile.html";
        iframesDiv.appendChild(frame);
    }
}

function changeFramesPGN(val) {
    // Change round (PGN file) for all miniboards
    val = Number(val);

    if (val >= 0 && val < allPGNs.length) {
        let newPgnUrl = allPGNs[val][1];

        // Change PGN for all miniboards
        let iframes = document.querySelectorAll("iframe");
        for(let i = 0; i < iframes.length; i++) {
            iframes[i].contentWindow.changePgn(newPgnUrl);
        }

        // Readjust chosenGames array to select the first games
        chosenGames = Array(numberMiniboards);
        for (let i = 0; i < numberMiniboards; ++i) {
            chosenGames[i] = i;
        }
    }

    // Restart live broadcast
    restartBroadcast();
}

function toggleControlPanels() {
    // Display or hide the navigation buttons for each miniboard
    let iframes = document.querySelectorAll("iframe");

    for(let i = 0; i < iframes.length; i++) {
        iframes[i].contentWindow.toggleControlPanel();
    }
}

function toggleMoveHighlight() {
    // Toggle move highlighting for each miniboard
    let iframes = document.querySelectorAll("iframe");

    for(let i = 0; i < iframes.length; i++) {
        iframes[i].contentWindow.toggleHighlight();
    }
}

function updateModalContent() {
    document.getElementById("MaxSelected").innerHTML = numberMiniboards;
    document.getElementById("CountSelected").innerHTML = chosenGames.length;

    // Clear old modal content
    let optionsDiv = document.getElementById("GamesSelectionContainer");
    while (optionsDiv.firstChild) {
        optionsDiv.removeChild(optionsDiv.lastChild);
    }

    // Information about all games in PGN file
    let frame0 = document.getElementById('frame0');
    let whites = frame0.contentWindow.gameWhite;
    let blacks = frame0.contentWindow.gameBlack;
    let results = frame0.contentWindow.gameResult;

    // Generate new modal content
    for (let i = 0; i < whites.length; ++i) {
        let option = document.createElement("div");
        option.className = "row align-items-center my-1";
        let game = document.createElement("div");
        game.className = "col-8";
        game.innerHTML = whites[i] + " - " + blacks[i];
        let result = document.createElement("div");
        result.className = "col-2 p-0";
        result.innerHTML = results[i].split('1/2').join("½");
        let checkboxDiv = document.createElement('div');
        checkboxDiv.className = "col-2";
        let checkbox = document.createElement('input');
        checkbox.className = "position-static";
        checkbox.type = "checkbox";
        checkbox.value = String(i);
        checkbox.addEventListener("click", handleCheckboxClick);
        if (chosenGames.includes(i)) {
            checkbox.checked = true;
        }

        checkboxDiv.appendChild(checkbox);
        option.appendChild(game);
        option.appendChild(result);
        option.appendChild(checkboxDiv);
        optionsDiv.appendChild(option);
    }
}

function updateDisplayGames() {
    // Reorder games chosen for display
    chosenGames.sort(function(a,b){ return a-b; });

    // Render chosen games in order of appearing in the PGN file
    let iframes = document.querySelectorAll("iframe");
    for(let i = 0; i < iframes.length; i++) {
        iframes[i].contentWindow.Init(chosenGames[i]);
    }

    // Scroll modal games list to top
    document.getElementById("GamesSelectionContainer").scrollTop = 0;
}

function handleCheckboxClick(evt) {
    let ind = Number(evt.target.value);
    if (chosenGames.includes(ind)) {
        chosenGames.splice(chosenGames.indexOf(ind), 1);
    }
    else {
        chosenGames.push(ind);
    }

    let chosenCount = document.getElementById("CountSelected");
    chosenCount.innerHTML = chosenGames.length;
    if (Number(chosenCount.innerHTML) != numberMiniboards) {
        chosenCount.style.setProperty("color", "red");
        document.getElementById("multiboardSaveBtn").disabled = true;
    }
    else {
        chosenCount.style.setProperty("color", "");
        document.getElementById("multiboardSaveBtn").disabled = false;
    }
}

function toggleView(ind) {
    // Change from single to multiple board view or vice versa

    if (ind == 0) {
        // Change to single board view
        document.getElementById("MultiBoardView").style.display = 'none';
        document.getElementById("SingleBoardView").style.display = '';
    }
    else {
        // Change to multiple boards view
        document.getElementById("MultiBoardView").style.display = '';
        document.getElementById("SingleBoardView").style.display = 'none';
        // Turn off engine
        if (engineStatus)
            toggleEngine();
    }

    if (!iframesGenerated) {
        generateIframes();
    }

    iframesGenerated = true;

    // After changing views, a board may remain outdated, so we restart broadcast
    restartBroadcast()
}

// Iframe0 will send messages when it changes it's PGN so the "select game" modal can be updated
window.addEventListener("message", receiveMessage, false);

function receiveMessage(evt) {
    let target = location.protocol + "//" + location.hostname + (location.port.length > 0 ? ":" + location.port : "");
    if (evt.origin !== target) {
        return;
    }

    if (evt.data == "PgnTextLoaded") {
        updateModalContent();
    }

    if (evt.data.includes("frame") && evt.data.includes("Ready")) {
        let ind = String(evt.data.substr(5,1));
        iframesLoaded[ind] = 1;

        // If all iframes are loaded, load first PGN file
        if (iframesLoaded.reduce((a, b) => a + b) == numberMiniboards) {
            changeFramesPGN(0);
        }
    }
}
