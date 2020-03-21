// Note: This code assumes pgn4web.js is loaded and relies on variables and functions defined therein

//=========================================================== 
// Global variables
//=========================================================== 
var allPGNs = []           // Array of PGN files to be filled
var started = false;        // Boolean indicating wheter a PGN file was loaded once

//=========================================================== 
// Settings
//=========================================================== 
SetImagePath("../pgn4web-3.04/images");
SetAutoplayDelay(1000);
SetHighlightOption(true);
SetTouchEventEnabled(false);
clearShortcutSquares("abcdefgh", "12345678")
SetGameSelectorOptions(null, false, 0, 0, 0, 20, 20, 7, 0);
SetLiveBroadcast(.25, false, false);
// Set the game on first or last move based on first argument: "start" or "end".
// This function call is only relevant for startup. Otherwise check the changePGN(...) function
SetInitialHalfmove("end", true);

//=========================================================== 
// Information about rounds and tournament
//=========================================================== 
SetPgnUrl("pgn/r1.pgn") // Active PGN (current round)

function operaterSettings() {
    // All rounds
    allPGNs.push(["1. kolo - dd/mm/gggg ss:mm", "pgn/r1.pgn"])
    allPGNs.push(["2. kolo - dd/mm/gggg ss:mm", "pgn/r2.pgn"])
    allPGNs.push(["3. kolo - dd/mm/gggg ss:mm", "pgn/r3.pgn"])
    allPGNs.push(["4. kolo - dd/mm/gggg ss:mm", "pgn/r4.pgn"])
    allPGNs.push(["Arhiva", "pgn/all.pgn"])

    // PGN download buttons
    document.getElementById("currLink").href = pgnUrl;         // current active pgn
    document.getElementById("allLink").href = "pgn/all.pgn";   // all rounds
    // Link for chess-results
    document.getElementById("ChessResultLink").href = "https://chess-results.com/";
    // Link for photo gallery
    document.getElementById("PhotoLink").href = "https://www.example.com";
    // Link for tournament details (can be a link to a local file)
    document.getElementById("Raspis").href = "https://www.example.com";
    // Paragraph for operater
    document.getElementById("OperaterPar").innerHTML = "operater: " + "&lt; ime operatera &gt;";
}

//=========================================================== 
// Main part of the program
//=========================================================== 
function customFunctionOnPgnGameLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN
    
    if (!started) {
        // Code in this block exectues only once

        // Set up hyperlinks, PGN files etc.
        operaterSettings();

        // Set up round select menu
        let selectRoundElem = document.getElementById("PgnFileSelect");        
        for (let i = 0; i < allPGNs.length; ++i){
            let option = document.createElement("option");
            option.value = String(i);
            option.innerHTML = allPGNs[i][0];
            selectRoundElem.appendChild(option);
        }

        changePGN(-1);
        started = true;
    }

    // Code that runs on each change of PGN file
    document.getElementById("GameSelSelect").firstElementChild.innerHTML = "Odaberite partiju";
    
    adjustSquareSize();

    // Add Elo ratings
    customPgnHeaderTag("WhiteElo", "GameWhiteRating");
    customPgnHeaderTag("BlackElo", "GameBlackRating");
    
    // For players without rating, set a dash
    let whiteRat = document.getElementById("GameWhiteRating");
    let blackRat = document.getElementById("GameBlackRating");
    if (whiteRat.innerHTML == "0")
        whiteRat.innerHTML = "-"
    if (blackRat.innerHTML == "0")
        blackRat.innerHTML = "-"

    // Adjust draw sign
    let resultElem = document.getElementById("GameResult");
    if (resultElem.innerHTML == "1/2-1/2")
        resultElem.innerHTML = "½-½";

    // Rotate back, if the board was rotated
    if (IsRotated) {
        flipBoard();
    }
}

function adjustSquareSize(scale = 1) {
    // Set up square sizes, and height/width of game and engine evaluation texts,
    //  according to the screen size
    
    let boardWidth = scale * document.getElementById("GameBoard").clientWidth;
    let width = String(Math.floor(boardWidth / 8));
    let btnWidth = String(Math.floor(0.9 * boardWidth / 5));

    ws = document.getElementsByClassName("whiteSquare");
    bs = document.getElementsByClassName("blackSquare");
    ps = document.getElementsByClassName("pieceImage");
    bc = document.getElementsByClassName("buttonControl");
    bcp = document.getElementsByClassName("buttonControlPlay");

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

    for (i = 0; i < bc.length; ++i)
        bc[i].setAttribute("style", "width: " + btnWidth + "px;");

    for (i = 0; i < bcp.length; ++i)
        bcp[i].setAttribute("style", "width: " + btnWidth + "px;");

    // Set height/width of game text divs and engine evaluation divs
    let gtDiv = document.getElementById("GameTextDiv");
    let gt = document.getElementById("GameText");
    gtDiv.style.setProperty("height", "100%")
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
}

function changePGN(val) {
    val = Number(val); 
    let arg = "end"                // "start" or "end".
    SetInitialHalfmove(arg, true); // Set the game on first or last move based on first argument

    // Scroll game text to the bottom
    let gt = document.getElementById("GameText");
    gt.scrollTop = arg == "end" ? gt.scrollHeight : 0;
    
    if (val >= 0 && val < allPGNs.length) {
        SetPgnUrl(allPGNs[val][1]);
        document.getElementById("currLink").href = pgnUrl;
    }

    LiveBroadcastLastModified = (new Date(0));
    LiveBroadcastLastModifiedHeader = LiveBroadcastLastModified.toUTCString();
    restartLiveBroadcast();
}

function modalOpen() {
    let elemFEN = document.getElementById("FENinput");
    elemFEN.value = CurrentFEN();

    let elemPGN = document.getElementById("PGNinput");
    elemPGN.value = fullPgnGame(currentGame);
}

function copyInput(element) {
    let elem = document.getElementById(element);
    elem.select();
    elem.setSelectionRange(0, 99999); // Mobile phones
    document.execCommand("copy");
}

function flipBoard() {
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

    FlipBoard();  // This function call will refresh all the default tags (GameWhite, GameWhiteClock etc)
    adjustSquareSize();
}

//=========================================================== 
// Engine
//=========================================================== 
var engine;
var toMove;
var engineStatus = 0
var icons = ["assets/images/toggleButton.png",  // OFF
             "assets/images/toggleButton1.png"] // ON

function initializeEngine() {
    engine = new Worker("assets/js/stockfish.js");
    
    // Callback from engine 
    engine.onmessage = function onmessage(event) {
        let msg = event.data

        // Evaluation message from engine
        if (msg.indexOf("info depth") !== -1 &&
            msg.indexOf("lowerbound") == -1  &&
            msg.indexOf("upperbound") == -1) {
            tokens = msg.split(" ")
            
            // Reconstruct variation
            let game = new Chess(CurrentFEN());            
            moves = ""
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
                score = Number(tokens[tokens.indexOf("mate") + 1])
            }
            // Centipawn loss (from engine's point of view)
            else {
                score = Number(tokens[tokens.indexOf("cp") + 1]) / 100
            }

            if (toMove === "black")
                score *= -1

            score = String(score)

            if (msg.indexOf("mate") !== -1) {
                score = "#" + score
            }

            setEngineAnnotations(moves, "Dubina: " + depth, score);
        }        
    };
}


function setEngineAnnotations(line, depth, score) {
    if (!engineStatus)
        line = depth = score = ""
    
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
