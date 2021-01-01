// Note: This code assumes pgn4web.js is loaded and relies on variables and functions defined therein

//===========================================================
// Global variables - don't edit
//===========================================================
let allPGNs = [];        // Array of PGN files to be filled
let started = false;     // Boolean indicating whether a PGN file was loaded once
let displayedGame = "";  // Currently displayed game (used for rotating the board back for a new game)
let viewType = 0;        // Variable for toggling single and multi board view
let scaleOption = 1;     // TODO: Currently not used, to be considered when implementing resizing
let numActiveSnackbarMessages = 0;  // Used for hiding snackbar element after showing notifications
let currentPGN = 0       // Index of current PGN (used to generate a link for sharing)
let initialPGNFile = "";

//===========================================================
// Settings
//===========================================================
//----------------------------------------------------------
// Information about rounds and tournament
//----------------------------------------------------------
function listPGNFiles() {
    // List all the PGN files and corresponding information. The format is as follows:
    //
    // allPGNs.push({
    //     "pgn" : <string>
    //     "name" : <string>,
    //     "date" : <JavaScript Date object>,
    //     "video-left" : <string>,
    //     "video-right" : <string>,
    //     "hyperlinks" : <JavaScript object>
    // });
    //
    // Description:
    //              - "pgn" is the path to the PGN file
    //              - "name" is the label displayed in the game selection dropdown menu
    //   (optional) - "date" is used to disable selection of upcoming rounds;
    //                  (see also the variable `minsBeforeRound`)
    //   (optional) - "video-left" is a link to a video to be displayed on the left-hand side
    //   (optional) - "video-right" is a link to a video to be displayed on the right-hand side
    //   (optional) - "hyperlinks" is an object which assigns custom hyperlink targets for buttons
    //                   Note: It's the operator's task to ensure that all PGN files have values for
    //                         all custom buttons. If a value for a button is not defined for a PGN
    //                         file, the button keeps its old value (before changing the PGN file)
    //
    // See below for examples

    let begin;  // A variable which will be re-used in this function

    // To generate JavaScript Date object the following function can be used:
    //   dateFromArray([Year, Month, Day, Hour, Minute])
    begin = dateFromArray([2020, 11, 10, 13, 00])
    allPGNs.push({
        "name" : "1. kolo - " + dateToString(begin),
        "pgn" : "pgn/r1.pgn",
        "date" : begin,
        "video-left" : "https://www.youtube.com/embed/4jT0hUODzdQ",
        "hyperlinks" : {
            "ChessResultLink" : "https://www.example.com/a1",
            "CustomButton" : "https://www.example.com/b1"
        }
    });

    begin = dateFromArray([2020, 11, 11, 13, 00])
    allPGNs.push({
        "name" : "2. kolo - " + dateToString(begin),
        "pgn" : "pgn/r2.pgn",
        "date" : begin,
        "hyperlinks" : {
            "ChessResultLink" : "https://www.example.com/a2",
            "CustomButton" : "https://www.example.com/b2"
        }
    });

    begin = dateFromArray([2020, 11, 12, 13, 00])
     allPGNs.push({
         "name" : "3. kolo - " + dateToString(begin),
         "pgn" : "pgn/r3.pgn",
         "date" : begin,
         "video-right" : "https://www.youtube.com/embed/ytdjYjM-cLg",
         "hyperlinks" : {
            "ChessResultLink" : "https://www.example.com/a3",
            "CustomButton" : "https://www.example.com/b3"
        }
    });

    begin = dateFromArray([2020, 12, 13, 13, 00])
    allPGNs.push({
        "name" : "4. kolo - " + dateToString(begin),
        "pgn" : "pgn/r4.pgn",
        "date" : begin,
        "hyperlinks" : {
            "ChessResultLink" : "https://www.example.com/a4",
            "CustomButton" : "https://www.example.com/b4"
        }
    });

    allPGNs.push({
        "name" : "Arhiva",
        "pgn" : "pgn/all.pgn",
        "hyperlinks" : {
            "ChessResultLink" : "https://www.example.com/a0",
            "CustomButton" : "https://www.example.com/b0"
        }
    });

    // In case no PGN is set in the URI parameter (share option), this PGN will be used at startup.
    // If this path is not correct,  an error from pgn4web will be displayed in the moves section
    initialPGNFile = "pgn/r1.pgn";
}

function operatorSettings() {
    // PGN download buttons
    document.getElementById("currLink").href = pgnUrl;         // current active pgn
    document.getElementById("allLink").href = "pgn/all.pgn";   // all rounds

    // To enable a (fixed) live stream / video for all rounds use:
    // enableVideoDiv("VideoDivLeft", "https://www.youtube.com/embed/<your-code>");
    // enableVideoDiv("VideoDivRight", "https://www.youtube.com/embed/<your-code>");

    // List all the footer hyperlinks. The format is as follows:
    //
    // footerLinks.push({
    //     "text"    : <string>
    //     "link"    : <string>,
    //     "fa-icon" : <string>,
    //     "size"    : <JavaScript Array> (5 elements),
    //     "id"      : <string>
    // });
    //
    // Description:
    //              - "text" is the label of the button (displayed text)
    //              - "link" is the hyperlink reference (e.g. URI) of the button
    //   (optional) - "fa-icon" is the font-awesome class of the icon displayed near the button;
    //                  you can choose one from: https://fontawesome.com/icons?d=gallery&m=free
    //   (optional) - "size" are the bootstrap grid breakpoint sizes for buttons - 5 values:
    //                  [a, b, c, d, e], where
    //                  a = width for extra small screens (<576px),
    //                  b = width for small  screens      (>=576px),
    //                  c = width for medium screens      (>=768px),
    //                  d = width for large screens       (>=992px),
    //                  e = width for extra large screens (>=1200px).
    //                  Note: each width is a number from 1 (small button) to 12 (full row button).
    //                  Default value is [12, 6, 4, 3, 2]
    //   (optional) - "id" is the ID of the HTML element - used for "hyperlinks" option in allPGNs
    //
    // See below for examples

    let footerLinks = [];
    footerLinks.push({
        "text" : "Novi gumb",
        "id"   : "CustomButton",
        "link" : ""
        // For this element, "link" will be provided from allPGNs
        });

    footerLinks.push({
        "text" : "Chess-results",
        "id"   : "ChessResultLink",
        "link" : ""
        // For this element, "link" will be provided from allPGNs
    });

    footerLinks.push({
        "text" : "Fotogalerija",
        "link" : "https://www.example.com",
        "fa-icon" : "fas fa-images"
    });

    // Note: this button is smaller, the next one is bigger so that the full xl-row sums up to 12
    // Link for tournament details (can be a link to a local file)
    footerLinks.push({
        "text" : "Raspis",
        "link" : "https://www.example.com",
        "size" : [12, 6, 6, 4, 1],
    });

    // Operator's contact button
    footerLinks.push({
        "text" : "operater: " + "Ime Operatera",
        "link" : "mailto:" + "operator@mailserver.com",
        "size" : [12, 6, 6, 4, 3],
        "fa-icon" : "fas fa-envelope"
    });

    // Link to clint GitHub page
    footerLinks.push({
        "text" : "Repozitorij",
        "link" : "https://www.github.com/pnikic/clint",
        "fa-icon" : "fab fa-github"
    });

    generateFooterLinks(footerLinks);
}

//----------------------------------------------------------
// Single board view
//----------------------------------------------------------
// Path to /images folder of pgn4web
SetImageType("svg");
SetImagePath("../pgn4web-3.04/images/svgchess");

// Set default delay for autoplay of the game (in milliseconds)
let autoplayDelay = 3000;
SetAutoplayDelay(autoplayDelay);

// Set starting value for move highlighting
SetHighlightOption(true);

// Set touch gestures (for mobile phones)
SetTouchEventEnabled(false);

// Shortcuts on the chessboard (after clicking a square)
clearShortcutSquares("abcdefgh", "12345678");

// SetLiveBroadcast(delay, alertFlag, demoFlag, stepFlag, endlessFlag):
//   delay (refresh delay in minutes),
//   alertFlag (display debug messages),
//   demoFlag (if true starts broadcast demo mode),
//   stepFlag (if true, autoplays updates in steps),
//   endlessFlag (if true, keeps polling for new moves even after all games are finished)
// SetLiveBroadcast(.25, false);
SetLiveBroadcast(.25, false, false, true, false);

// Set the game on first or last move based on first argument: "start" or "end".
// This function call is only relevant for startup. Otherwise check the changePGN(...) function
SetInitialHalfmove("end", true);

// Number of minutes before the round start for enabling current round selection
let minsBeforeRound = 45;

//----------------------------------------------------------
// Multiple boards view
//----------------------------------------------------------
let numberMiniboards = 6;


//===========================================================
// Other initialization code
//===========================================================
// Check preferences from local storage
if (localStorage.getItem("clint-theme") == "dark")
    toggleTheme();

// Fill the values in allPGNs
listPGNFiles();

// Set the PGN from the URI parameter, if applicable
let url = new URLSearchParams(window.location.search);
let ret = false;
if (url.has("pgn"))
{
    let val = Number(url.get("pgn"));
    if (typeof(val) == "number" && val >= 0 && val < allPGNs.length)
    {
        currentPGN = val;
        ret = selectPGN(allPGNs[val]["pgn"]);
    }
}
// Otherwise, set a default PGN file
if (!ret) {
    selectPGN(initialPGNFile);
}

//===========================================================
// Main part of the program
//===========================================================
function generateFooterLinks(linksArray)
{
    for (link of linksArray)
    {
        let div = document.createElement("div");
        let size = [12, 6, 4, 3, 2];
        let breaks = ["", "sm-", "md-", "lg-", "xl-"];
        if ("size" in link && link["size"].length == 5)
            size = link["size"];

        // Generate a string of format "col-v col-sm-w col-md-x col-lg-y col-xl-z"
        //   using [v, w, x, y, z] from link["size"]
        let classString = size.map((a, b) => {return "col-" + breaks[b] + String(a)}).join(' ');
        div.className = classString;

        let anchor = document.createElement("a");
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.className = "badge badge-custom my-1 p-2";

        if ("id" in link)
            anchor.id = link["id"];

        if ("link" in link)
            anchor.href = link["link"];

        let title = document.createElement("h5");
        title.className = "m-0 d-inline-block";

        let text = "...";
        if ("text" in link)
            text = link["text"];

        title.innerText = text;

        anchor.appendChild(title);
        if ("fa-icon" in link)
        {
            let icon = document.createElement("i");
            icon.className = link["fa-icon"] + " my-auto h5 pl-2";
            anchor.appendChild(icon);
        }

        div.appendChild(anchor);
        document.getElementById("FooterRow").appendChild(div);
    }
}

function pad(str, totalChars, padChar) {
    return (totalChars > str.length ? String(padChar).repeat(totalChars - str.length) : "") +  str;
}

function dateToString(date) {
    return String(date.getDate() + "/" + String(date.getMonth() + 1)) + "/" + String(date.getFullYear())
         + " " + pad(String(date.getHours()), 2, "0") + ":" + pad(String(date.getMinutes()), 2, "0");
}

function dateFromArray(arr)
{
    // Check if the input is an array of five numbers
    if (arr.length != 5 || !((arr.map(x => typeof(x))).every(x => x == "number")))
        return

    let date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
    return date;
}

function customFunctionOnPgnGameLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN
    adjustSquareSize(scaleOption);

    // Add Elo ratings
    customPgnHeaderTag("WhiteElo", "GameWhiteRating");
    customPgnHeaderTag("BlackElo", "GameBlackRating");

    // For players without rating, leave an empty field
    let whiteRat = document.getElementById("GameWhiteRating");
    let blackRat = document.getElementById("GameBlackRating");
    if (whiteRat.innerHTML == "0") {
        whiteRat.innerHTML = "";
    }

    if (blackRat.innerHTML == "0") {
        blackRat.innerHTML = "";
    }

    // If a new game is loaded and the board was rotated, rotate back
    // After loading a new game, white will always be on bottom
    if (IsRotated && getDisplayedGame() != displayedGame) {
        flipBoard();
    }

    displayedGame = getDisplayedGame();
    updateResult();
    highlightSelectedGame();
}

function updateResult() {
    let resultElem = document.getElementById("GameResult");
    let placeTop = document.getElementById("ResultBlack");
    let placeBot = document.getElementById("ResultWhite");
    let res = resultElem.innerHTML;

    placeTop.innerHTML = placeBot.innerHTML = "✻";

    if (res == "1/2-1/2") {
        placeTop.innerHTML = placeBot.innerHTML = "½";
    }
    else if (res == "1-0" || res == "0-1") {
        placeTop.innerHTML = IsRotated ? res[0] : res[2];
        placeBot.innerHTML = IsRotated ? res[2] : res[0];
    }
}

function getDisplayedGame() {
    // Returns an (almost) unique identifer of a chess game
    return gameWhite[currentGame] + " - " + gameBlack[currentGame] + ", "
         + (gameDate.length ? gameDate[currentGame] : "");
}

function getBoardWidth() {
    let boardItem = document.getElementsByClassName("boardItem")[0];
    return scaleOption * Math.min(boardItem.offsetHeight, boardItem.offsetWidth);
}

function adjustSquareSize(scale = 1) {
    if (isNaN(scale)) {
        return;
    }

    scaleOption = scale;

    // Cancel the style for boardTable element set by pgn4web
    let boardTable = document.getElementById("boardTable");
    boardTable.style.setProperty("width", "");
    boardTable.style.setProperty("height", "");

    // Set up square sizes, and height/width of game and engine evaluation texts,
    //  according to the screen size
    let boardWidth = getBoardWidth();
    let width = String(Math.floor(boardWidth / 8));

    let targetClass = ["whiteSquare", "blackSquare", "highlightWhiteSquare", "highlightBlackSquare", "pieceImage"];
    for (let i = 0; i < targetClass.length; ++i) {
        let collection = document.getElementsByClassName(targetClass[i]);
        for (let j = 0; j < collection.length; ++j) {
            collection[j].setAttribute("width", width);
            collection[j].setAttribute("height", width);
        }
    }

    adjustSidePanelSizes();
}

function adjustSidePanelSizes() {
    let boardWidth = getBoardWidth();

    // Set height/width of game text divs and engine evaluation divs
    let gt = document.getElementById("GameText");
    let engineHeight = document.getElementById("EngineEvalDiv").offsetHeight;
    let variationHeight = document.getElementById("EngineVariationDiv").offsetHeight;
    let videoDivR = document.getElementById("VideoDivRight");
    videoDivR.style.setProperty("height", String(0.5 * boardWidth) + "px");
    let videoHeightR = videoDivR.offsetHeight;
    // We want the moves, engine evaluation and best line with the margins to fit the board size
    gt.style.setProperty("max-height", String(boardWidth - videoHeightR - engineHeight - variationHeight - 16) + "px");

    // Set height of game selection div assuming game selection header + search bare take up to 95 px
    let videoDivL = document.getElementById("VideoDivLeft");
    videoDivL.style.setProperty("height", String(0.5 * boardWidth) + "px");
    let videoHeightL = videoDivL.offsetHeight;
    let gameSel = document.getElementById("GameSelectionDiv");
    gameSel.style.setProperty("max-height", String(boardWidth - videoHeightL - 95) + "px");
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
    setAutoplayButton();
}

function selectPGN(filename) {
    // Setting PGN using one of the filenames defined in allPGNs array -
    //   small wrapper around SetPgnUrl which also restarts the broadcast.
    //   Returns true in case of success

    for (elem of allPGNs)
    {
        if (!elem["pgn"])
            continue;

        fullPathPgn = elem["pgn"];
        relativePathPgn = fullPathPgn.substring(fullPathPgn.lastIndexOf("/") + 1)
        // Check for either full filename or relative filename
        if (filename == fullPathPgn || filename == relativePathPgn) {
            SetPgnUrl(fullPathPgn);
            restartBroadcast();
            return true;
        }
    }

    return false;
}

function changePGN(val) {
    // Callback for the "select round" menu in single board view
    val = Number(val);
    let arg = "end"  // "start" or "end"

    if (val >= 0 && val < allPGNs.length && allPGNs[val]["pgn"]) {
        // Set the game on first or last move based on first argument
        SetInitialHalfmove(arg, true);
        // Scroll game text to the top or bottom
        let gt = document.getElementById("GameText");
        gt.scrollTop = arg == "end" ? gt.scrollHeight : 0;

        SetPgnUrl(allPGNs[val]["pgn"]);
        document.getElementById("currLink").href = pgnUrl;
        currentPGN = val;
        restartBroadcast();
    }
}

function modalOpen() {
    // Refres FEN and PGN values in the "share" modal
    let elemFEN = document.getElementById("FENinput");
    elemFEN.value = CurrentFEN();

    let elemPGN = document.getElementById("PGNinput");
    elemPGN.value = fullPgnGame(currentGame);

    let elemLink = document.getElementById("ShareGameInput");
    elemLink.value = linkToCurrentGame();
}

function copyInput(element) {
    // Copy element content to clipboard
    let elem = document.getElementById(element);
    elem.select();
    elem.setSelectionRange(0, 99999); // Mobile phones
    document.execCommand("copy");
}

function linkToCurrentGame() {
    let href = window.location.href;
    let uriParamsStart = href.indexOf("?");
    if (uriParamsStart != -1)
        href = href.substring(0, uriParamsStart);

    let link = href + "?" +
               encodeURIComponent("pgn") + "=" + encodeURIComponent(currentPGN) + "&" +
               encodeURIComponent("game") + "=" + encodeURIComponent(currentGame);

    return link;
}

function flipBoard() {
    // Wrapping the pgn4web's FlipBoard() function, to also change the position
    //  of player's informations (name, rating, clock, colored square)

    // Flip colored square places
    let wsn = document.getElementById("ResultWhite");
    let bsn = document.getElementById("ResultBlack");
    document.getElementById("ResultPlace1").appendChild(IsRotated ? bsn : wsn);
    document.getElementById("ResultPlace2").appendChild(IsRotated ? wsn : bsn);

    // Flip rating places
    let ratB = document.getElementById("GameBlackRating");
    let ratW = document.getElementById("GameWhiteRating");
    document.getElementById("RatingPlace1").appendChild(IsRotated ? ratB : ratW);
    document.getElementById("RatingPlace2").appendChild(IsRotated ? ratW : ratB);

    // Flip player names places
    let nameB = document.getElementById("GameBlack");
    let nameW = document.getElementById("GameWhite");
    document.getElementById("PlayerPlace1").appendChild(IsRotated ? nameB : nameW);
    document.getElementById("PlayerPlace2").appendChild(IsRotated ? nameW : nameB);

    // Flip clock places
    let clkB = document.getElementById("GameBlackClock");
    let clkW = document.getElementById("GameWhiteClock");
    document.getElementById("ClockPlace1").appendChild(IsRotated ? clkB : clkW);
    document.getElementById("ClockPlace2").appendChild(IsRotated ? clkW : clkB);

    FlipBoard();  // This function call will refresh all the default tags (GameWhite, GameWhiteClock etc)...
    adjustSquareSize(scaleOption); // ...and also mess up with piece image sizes, so we resize them
    //updateResult();
}

//===========================================================
// Engine
//===========================================================

// Engine global variables
let engine;
let toMove;
let engineStatus = 0;

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
    adjustSidePanelSizes();
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
    let engineIcon = document.getElementById("engineToggleIcon");
    engineIcon.className = engineStatus ? "fas fa-toggle-on" : "fas fa-toggle-off";

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

    if (e.target.id == "SearchInput")
        return;

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

function hideSnackbarMessage()
{
    let sb = document.getElementById("Snackbar");
    sb.className = sb.className.replace("show", "");

}

function removeSnackbarMessage(){
    numActiveSnackbarMessages = Math.max(0, numActiveSnackbarMessages - 1);

    if (!numActiveSnackbarMessages)
    {
        let sb = document.getElementById("Snackbar");
        sb.className = sb.className.replace("show", "");
    }
}

function snackbarMessage(msg) {
    numActiveSnackbarMessages += 1
    let sb = document.getElementById("Snackbar");
    sb.className = "show";
    sb.innerHTML = msg;

    setTimeout(function(){
        removeSnackbarMessage();
    }, 2750);
}

function setAutoplayButton() {
    let play = "&#9654;";
    let pause = "|&nbsp;|";
    document.getElementById("AutoPlayBtn").innerHTML = isAutoPlayOn ? pause : play;
}

function toggleAutoplay() {
    if (CurrentPly == PlyNumber)
        return;

    SetAutoPlay(!isAutoPlayOn);
    setAutoplayButton();
}

function setAutoplayDelay(evt, change) {
    // Do not close the parent dropodown menu
    evt.stopPropagation();

    // This function is called with +1 or -1, depending on the user input
    let step = 500;
    autoplayDelay += change * step;

    // In pgn4web.js, minimum delay is 500, and maximum is 300000
    autoplayDelay = Math.min(Math.max(autoplayDelay, minAutoplayDelay), maxAutoplayDelay);
    // Calling the pgn4web function for setting autoplay
    SetAutoplayDelay(autoplayDelay);
    document.getElementById("AutoplayDelaySpan").innerHTML = String(autoplayDelay / 1000);
}

function customFunctionOnPgnTextLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN

    if (!started) {
        // Code in this block exectues only once
        started = true;

        // customFunctionOnPgnTextLoad() is called at the end of createBoard() in pgn4web.js
        //   which is in turn trigerred by start_pgn4web() on startup. We hook to this chain
        //   by immediately changing the game to the one defined in the URL parameter, if any.
        if (url.has("game"))
            changeGame(url.get("game"));

        // Set up hyperlinks, PGN files etc.
        operatorSettings();

        // Set up round select menu (for single- and multi-board view)
        let selectRoundElem = document.getElementById("PgnFileSelect");
        let mbSelectRoundElem = document.getElementById("MultiboardFileSelect");
        let now = new Date();

        for (let i = 0; i < allPGNs.length; ++i){
            let option = document.createElement("option");
            option.value = String(i);

            if (allPGNs[i]["name"])
                option.innerHTML = allPGNs[i]["name"];
            else
                option.innerHTML = "Unknown PGN";

            // If the round will start at later point in time, disable its selection
            if (allPGNs[i]["date"] && new Date(allPGNs[i]["date"].getTime() - minsBeforeRound * 60000) > now) {
                option.disabled = true;
            }

            selectRoundElem.appendChild(option);
            mbSelectRoundElem.appendChild(option.cloneNode(true));
        }

        // Display numbers in settings dropdown
        document.getElementById("AutoplayDelaySpan").innerHTML = String(autoplayDelay / 1000);
        // document.getElementById("BoardSizeSpan").innerHTML = scaleOption;
    }

    // Update of options in "select game" grid area
    let gameSel = document.getElementById("GameSelectionDiv");

    // Delete all options
    while (gameSel.childElementCount > 0) {
        gameSel.removeChild(gameSel.lastChild);
    }

    // (Re)generate the game selection menu
    for (let i = 0; i < numberOfGames; ++i) {
        let optionDiv = document.createElement("div");
        optionDiv.className = "row m-0";
        optionDiv.onclick = (evt) => {
            changeGame(i);
            highlightSelectedGame();
        };

        let spanNum = document.createElement("span");
        spanNum.className = "col-1 py-0";
        // spanNum.className = "py-0";
        spanNum.innerHTML = String(i + 1);

        let players = document.createElement("h6");
        players.className = "col-11";
        players.innerHTML = gameWhite[i] + " - " + gameBlack[i];

        optionDiv.appendChild(spanNum);
        optionDiv.appendChild(players);
        gameSel.appendChild(optionDiv);
    }

    highlightSelectedGame();

    // Clear game search text
    clearSearchInput();

    // Update the video, if any is specified
    let video_left = allPGNs[currentPGN]["video-left"],
        video_right = allPGNs[currentPGN]["video-right"];

    if (video_left != undefined)
        enableVideoDiv("VideoDivLeft", video_left);
    else
        disableVideoDiv("VideoDivLeft");

    if (video_right != undefined)
        enableVideoDiv("VideoDivRight", video_right)
    else
        disableVideoDiv("VideoDivRight");

    // Update hyperlink references of buttons, if any are specified
    let links = allPGNs[currentPGN]["hyperlinks"];
    if (links != undefined)
    {
        for (const [key, value] of Object.entries(links))
        {
            let anchor = document.getElementById(key);
            if (anchor && anchor.hasAttribute("href"))
            {
                anchor.href = value;
            }
        }
    }
}

function changeGame(ind) {
    // Callback for the "select game" menu in single board view
    Init(ind);
}

function highlightSelectedGame() {
    let query = document.querySelector("#GameSelectionDiv div.active");
    if (query !== null) {
        query.classList.remove("active");
    }

    // Note: currentGame and numberOfGames are variables defined by pgn4web
    let gameSel = document.getElementById("GameSelectionDiv");
    if (currentGame < gameSel.children.length)
        gameSel.children.item(currentGame).className += " active";

    // Scroll to the selected game
    let scrollSize = Math.max(0, gameSel.scrollHeight * currentGame / numberOfGames - gameSel.offsetHeight / 2);
    gameSel.scrollTop = parseInt(scrollSize);
}

function restartBroadcast() {
    LiveBroadcastLastModified = (new Date(0));
    LiveBroadcastLastModifiedHeader = LiveBroadcastLastModified.toUTCString();
    restartLiveBroadcast();
}

function disableVideoDiv(divId) {
    let videoDiv = document.getElementById(divId);
    if (videoDiv == null)
        return;

    videoDiv.style.display = "none";
    videoDiv.children[0].src = "";
    adjustSidePanelSizes();
}

function enableVideoDiv(divId, link) {
    let videoDiv = document.getElementById(divId);
    if (videoDiv == null)
        return;

    videoDiv.style.display = "";
    videoDiv.children[0].src = link;
    adjustSidePanelSizes();
}

function clearSearchInput() {
    let search = document.getElementById("SearchInput");
    search.value = "";
}

function searchInputChanged() {
    let search = document.getElementById("SearchInput");
    let value = search.value.toLowerCase();

    let gameSelectionDiv = document.getElementById("GameSelectionDiv");
    if (gameSelectionDiv.children.length != gameWhite.length ||
        gameSelectionDiv.children.length != gameBlack.length)
        return;

    for (let i = 0; i < gameSelectionDiv.children.length; ++i)
    {
        if (!gameWhite[i].toLowerCase().includes(value) &&
            !gameBlack[i].toLowerCase().includes(value))
            gameSelectionDiv.children[i].style.setProperty("display", "none");
        else
            gameSelectionDiv.children[i].style.setProperty("display", "");
    }
}

//===========================================================
// Multiple board view setup
//===========================================================
let iframesGenerated = false;
let iframesLoaded = Array(numberMiniboards).fill(0);
// Suppose the control panel is turned off by default (sync with mosaic-setup.js)
let controlPanelOption = false;

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
        // Add <br> elements between iframes
        if (i > 0) {
            let br = document.createElement("br");
            br.id = "br" + String(i - 1);
            br.style.display = "none";
            iframesDiv.appendChild(br);
        }

        let frame = document.createElement("iframe");
        frame.id = "frame" + String(i);
        frame.src = "mosaic-tile.html";
        frame.style.display = "none";

        // Set the dark theme if needed
        frame.onload = function() {
            setThemeMultiboard();
        }

        iframesDiv.appendChild(frame);
    }
}

function changeFramesPGN(val) {
    // Change round (PGN file) for all miniboards
    val = Number(val);

    if (val >= 0 && val < allPGNs.length && allPGNs[val]["pgn"]) {
        // Readjust chosenGames array to select the first games
        chosenGames = Array(numberMiniboards);
        for (let i = 0; i < numberMiniboards; ++i) {
            chosenGames[i] = i;
        }

        maximizeIframesTiles(controlPanelOption); // delete

        // Change PGN for all miniboards
        let newPgnUrl = allPGNs[val]["pgn"];
        let iframesDiv = document.getElementById("IframesContainer");
        let iframes = iframesDiv.querySelectorAll("iframe");
        for (let i = 0; i < iframes.length; i++) {
            iframes[i].style.display = "";
            iframes[i].contentWindow.changePgn(newPgnUrl);
        }

        // TODO: FIXME: I should be a callback
        /* console.log("Waiting a second");
         * setTimeout(() => {
         *     maximizeIframesTiles(controlPanelOption);
         * }, 2000);
         */
    }

    // Restart live broadcast
    restartBroadcast();
}

function toggleControlPanels() {
    controlPanelOption = !controlPanelOption;

    // Display or hide the navigation buttons for each miniboard
    let iframesDiv = document.getElementById("IframesContainer");
    let iframes = iframesDiv.querySelectorAll("iframe");

    for (let i = 0; i < iframes.length; i++) {
        iframes[i].contentWindow.toggleControlPanel();
    }

    maximizeIframesTiles(controlPanelOption);
}

function toggleMoveHighlight() {
    // Toggle move highlighting for each miniboard
    let iframesDiv = document.getElementById("IframesContainer");
    let iframes = iframesDiv.querySelectorAll("iframe");

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
    let frame0 = document.getElementById("frame0");
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
        result.innerHTML = results[i].split("1/2").join("½");
        let checkboxDiv = document.createElement("div");
        checkboxDiv.className = "col-2";
        let checkbox = document.createElement("input");
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
    let iframesDiv = document.getElementById("IframesContainer");
    let iframes = iframesDiv.querySelectorAll("iframe");
    for(let i = 0; i < chosenGames.length; i++) {
        iframes[i].style.display = "";
    }

    for (let i = chosenGames.length; i < iframes.length; ++i) {
        iframes[i].style.display = "none";
    }

    // Scroll modal games list to top
    document.getElementById("GamesSelectionContainer").scrollTop = 0;

    maximizeIframesTiles(controlPanelOption);

    // Restart live broadcast
    restartBroadcast();
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
    let cnt = chosenGames.length;
    chosenCount.innerHTML = cnt;
    if (cnt > numberMiniboards || cnt == 0) {
        chosenCount.style.setProperty("color", "red");
        document.getElementById("multiboardSaveBtn").disabled = true;
    }
    else {
        chosenCount.style.setProperty("color", "");
        document.getElementById("multiboardSaveBtn").disabled = false;
    }
}

function activateLineBreaks(gamesPerRow) {
    // According to number of games per row to be displayed,
    //   activate <br/> elements to display boards in their rows

    for (let i = 0; i < numberMiniboards - 1; ++i) {
        let el = document.getElementById("br" + String(i));
        el.style.display = "none";
    }

    let ind = gamesPerRow - 1;
    while (ind < numberMiniboards - 1) {
        let el = document.getElementById("br" + String(ind));
        el.style.display = "";
        ind += gamesPerRow;
    }
}

function maximizeIframesTiles(withPanel = true) {
    // Redisplay all the miniboards according to the display size
    // Use 3 boards per row on bigger screens, 2 or 1 on smaller screens

    // Maximum width and height for displaying all miniboards
    let width = document.getElementById("MultiBoardView").offsetWidth;
    // https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
    let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Note: if we have fewer than 3 boards, these boards will be maximized on the screen
    let gamesPerRow = Math.min(3, chosenGames.length);

    if (width < 768)
        gamesPerRow = 2;

    if (width < 576)
        gamesPerRow = 1;

    // Variant for smaller devices (scrolling needed to see other boards)
    let size = parseInt(.975 * width / gamesPerRow);

    if (width >= 768)
    {
        // On bigger screens, force displaying of all boards on the screen (no scrolling needed)
        let rows = parseInt((chosenGames.length - 1) / gamesPerRow) + 1;
        let optimalTileWidth = parseInt(.975 * width / gamesPerRow);
        let optimalTileHeight = parseInt(.975 * height / rows);
        size = Math.min(optimalTileHeight, optimalTileWidth);
    }

    // Toggle line breaks, to have boards in respective rows
    activateLineBreaks(gamesPerRow);

    // Calculate iframes dimensions
    // There are additional pixels for the control panel (36px) and the player names (2 x 32px)
    let additional = 64 + (withPanel ? 36 : 0);
    size = size - additional;
    // We set the board some pixels smaller to have some margins around the board
    let resize = .975 * size;

    let iframesDiv = document.getElementById("IframesContainer");
    let iframes = iframesDiv.querySelectorAll("iframe");
    for(let i = 0; i < chosenGames.length; i++) {
        iframes[i].width = size;
        iframes[i].height = size + additional;
        iframes[i].contentWindow.adjustBoardSize(resize);
        iframes[i].contentWindow.Init(chosenGames[i]);
    }
}

function toggleView(ind) {
    // Change from single to multiple board view or vice versa
    viewType = ind;

    if (ind == 0) {
        // Change to single board view
        document.getElementById("MultiBoardView").style.display = "none";
        document.getElementById("SingleBoardView").style.display = "";
    }
    else {
        // Change to multiple boards view
        document.getElementById("MultiBoardView").style.display = "";
        document.getElementById("SingleBoardView").style.display = "none";
        // Turn off engine
        if (engineStatus)
            toggleEngine();
        // Turn off autoplay
        if (isAutoPlayOn)
            toggleAutoplay();
    }

    if (!iframesGenerated) {
        generateIframes();
    }

    iframesGenerated = true;

    // After changing views, a board may remain outdated, so we restart broadcast
    restartBroadcast()
}

function toggleTheme() {
    let bodies = document.getElementsByTagName("body");
    if (bodies.length != 1)
        return;

    let currTheme = bodies[0].getAttribute("data-theme");
    if (currTheme != "dark")
    {
        bodies[0].setAttribute("data-theme", "dark");
        localStorage.setItem("clint-theme", "dark");
    }
    else
    {
        bodies[0].setAttribute("data-theme", "");
        localStorage.removeItem("clint-theme");
    }

    setThemeMultiboard();
}

function setThemeMultiboard() {
    let bodies = document.getElementsByTagName("body");
    if (bodies.length != 1)
        return;

    let currTheme = bodies[0].getAttribute("data-theme");
    let iframesDiv = document.getElementById("IframesContainer");
    let iframes = iframesDiv.querySelectorAll("iframe");

    for (let i = 0; i < iframes.length; i++) {
        let iframeBodies = iframes[i].contentWindow.document.getElementsByTagName("body");
        if (iframeBodies.length != 1)
            continue;

        if (currTheme == "dark")
            iframeBodies[0].setAttribute("data-theme", "dark");
        else
            iframeBodies[0].setAttribute("data-theme", "");
    }
}

function resizeCallback() {
    if (viewType == 0) {
        adjustSquareSize(scaleOption);
    }
    else {
        maximizeIframesTiles(controlPanelOption);
    }
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

function isMobile() {
    // https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device
    return window.matchMedia("only screen and (max-width: 760px)").matches || window.innerWidth < 960;
}
