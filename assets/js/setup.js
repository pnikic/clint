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
let currentPGN = 0       // Index of active PGN (from allPGNs)
let initialPGNFile = "";
let url = ""
let iframesGenerated = false;
let iframesLoaded = [];
let chessResultsPlayerData;    // Player's information from chess-results
// Suppose the control panel is turned off by default (sync with mosaic-setup.js)
let controlPanelOption = false;
let chosenGames = [];
let inlineNotationOption = false;
// Engine global variables
let engine;
let toMove;
let engineStatus = false;
const globalDepth = 21;
// Translations
let currentLanguage;
let translations = new Map();

//===========================================================
// Initialization code
//===========================================================
// Overrides CleanMove function from pgn4web.js if useAestheticNotation is true
if (useAestheticNotation) {
    var CleanMove = function(move) {
        return move;
    }
}

// Fill the values in allPGNs
listPGNFiles();
operatorSettings();
fetchTranslations();
fetchChessResultsPlayerData();

// Multiple boards setup
iframesLoaded = Array(numberMiniboards).fill(0);

// Array of displayed games, used for choose games modal
// By default, the first games are loaded
chosenGames = Array(numberMiniboards);
for (let i = 0; i < numberMiniboards; ++i) {
    chosenGames[i] = i;
}

// Set the PGN from the URI parameter, if applicable
url = new URLSearchParams(window.location.search);
let ret = false;
if (url.has("pgn")) {
    let val = Number(url.get("pgn"));
    if (typeof(val) == "number" && val >= 0 && val < allPGNs.length) {
        currentPGN = val;
        ret = selectPGN(allPGNs[val]["pgn"]);
    }
}
// Otherwise, set a default PGN file
if (!ret) {
    // Iterate through the list of rounds (`allPGNs`) and select the first one that is either
    //   - ongoing (maximum expected round length not elapsed)
    //   - not started
    let now = new Date();
    let selected = false;

    for (let i = 0; i < allPGNs.length && !selected; ++i) {
        if (allPGNs[i].hasOwnProperty("date") &&
            new Date(allPGNs[i]["date"].getTime() + expectedRoundDuration * 60000) > now) {
            selected = true;
            changePGN(i);
        }
    }

    if (!selected) {
        changePGN(0);
    }
}

// Check preferences from local storage
if (localStorage.getItem("clint-theme") == "alternative")
    toggleTheme();
if (localStorage.getItem("clint-view") == "multiple-boards")
    toggleView(1);
currentLanguage = localStorage.getItem("clint-language");
if (currentLanguage === null)
    currentLanguage = "en";
if (localStorage.getItem("clint-notation") == "inline")
    setInlineNotation(true);


//===========================================================
// Main part of the program
//===========================================================
function generateNavbarLinks(linksArray) {
    let navbar = document.getElementById("NavbarContent");
    let translateItem = navbar.childNodes[0];

    for (link of linksArray) {
        let item = document.createElement("li");
        let anchor = document.createElement("a");
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";

        let span = document.createElement("span");
        if ("id" in link) {
            anchor.id = link["id"];
            span.setAttribute("translate-key", link["id"]);
        }

        if ("link" in link)
            anchor.href = link["link"];

        if ("fa-icon" in link) {
            let icon = document.createElement("i");
            icon.className = link["fa-icon"] + " pe-2";
            anchor.appendChild(icon);
        }

        anchor.appendChild(span);
        item.appendChild(anchor);
        navbar.insertBefore(item, translateItem);
    }
}

function dateFromArray(arr) {
        // Check if the input is an array of five numbers
        if (arr.length != 5 || !((arr.map(x => typeof(x))).every(x => x == "number")))
            return

        let date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
        return date;
}

function setWithIncreasingValues(length, initialValue = 0) {
    let arr = Array.from({length: length}, (_, i) => i + initialValue);
    return new Set(arr);
}


function clearPlayerFlags() {
    document.getElementById("PlayerFlagWhite").innerHTML = "";
    document.getElementById("PlayerFlagBlack").innerHTML = "";
}


function addPlayerFlagsFromChessResultsData() {
    if (!chessResultsPlayerData)
        return false;

    let whiteIdentifier = customPgnHeaderTag("WhiteFideId");
    if (whiteIdentifier.length == 0)
        whiteIdentifier = gameWhite[currentGame];
    let blackIdentifier = customPgnHeaderTag("BlackFideId");
    if (blackIdentifier.length == 0)
        blackIdentifier = gameBlack[currentGame];

    let flagsFound = 0;
    for (row of chessResultsPlayerData) {
        if (row.includes(whiteIdentifier)) {
            const fed = row.split(" ").slice(1, 2);
            document.getElementById("PlayerFlagWhite").innerHTML = flagEmojiByThreeLetterCode(fed);
            flagsFound += 1;
        }
        if (row.includes(blackIdentifier)) {
            const fed = row.split(" ").slice(1, 2);
            document.getElementById("PlayerFlagBlack").innerHTML = flagEmojiByThreeLetterCode(fed);
            flagsFound += 1;
        }
    }

    return flagsFound == 2;
}


function addPlayerFlagsFromTeamNames() {
    const teamBlack = customPgnHeaderTag("BlackTeam");
    const teamWhite = customPgnHeaderTag("WhiteTeam");

    if (teamBlack.length > 0)
        document.getElementById("PlayerFlagBlack").innerHTML = flagEmojiByTeamName(teamBlack);
    if (teamWhite.length > 0)
        document.getElementById("PlayerFlagWhite").innerHTML = flagEmojiByTeamName(teamWhite);
}

function updatePlayerFlags() {
    clearPlayerFlags();
    let flagsAdded = addPlayerFlagsFromChessResultsData();
    if (!flagsAdded)
        addPlayerFlagsFromTeamNames();
}


function customFunctionOnPgnGameLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN
    adjustSquareSize(scaleOption);
    updatePlayerFlags();

    // Add Elo ratings
    let whiteElo = customPgnHeaderTag("WhiteElo", "GameWhiteRating");
    let blackElo = customPgnHeaderTag("BlackElo", "GameBlackRating");

    // For players without rating, leave an empty field
    if (whiteElo == "0") {
        document.getElementById("GameWhiteRating").innerHTML = "";
    }
    if (blackElo == "0") {
        document.getElementById("GameBlackRating").innerHTML = "";
    }

    if (getDisplayedGame() != displayedGame) {
        // If a new game is loaded and the board was rotated, rotate back
        // After loading a new game, white will always be on bottom
        if (IsRotated) {
            flipBoard();
        }

        displayedGame = getDisplayedGame();
        highlightSelectedGame();

        // Set custom tab title
        document.title = gameWhite[currentGame] + " vs. " + gameBlack[currentGame] + " | Clint";
    }
}

function getDisplayedGame() {
    // Returns an (almost) unique identifer of a chess game
    return gameWhite[currentGame] + " - " + gameBlack[currentGame] + ", "
         + (gameDate.length ? gameDate[currentGame] : "");
}

function getBoardWidth() {
    let boardItem = document.getElementById("BoardItem");
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

    let targetClass = ["whiteSquare", "blackSquare", "highlightWhiteSquare",
                       "highlightBlackSquare", "pieceImage"];
    for (let i = 0; i < targetClass.length; ++i) {
        let collection = document.getElementsByClassName(targetClass[i]);
        for (let j = 0; j < collection.length; ++j) {
            collection[j].setAttribute("width", width);
            collection[j].setAttribute("height", width);
        }
    }

    adjustSidePanelSizes();
}

function adjustLeftPanelSizes(panelHeight) {
    if (isSmallScreen() || isMediumScreen()) {
        document.getElementById("LeftPanel").style.removeProperty("height");
    }
    else {
        const heightStr = String(panelHeight) + "px";
        document.getElementById("LeftPanel").style.setProperty("height", heightStr);
    }
}

function adjustRightPanelSizes(panelHeight) {
    if (isSmallScreen()) {
        document.getElementById("RightPanel").style.removeProperty("height");
    }
    else {
        const heightStr = String(panelHeight) + "px";
        document.getElementById("RightPanel").style.setProperty("height", heightStr);
    }

    scrollGameTextToCurrentMove();
}

function adjustSidePanelSizes() {
    const boardWidth = getBoardWidth();
    const playerItemHeight = document.getElementById("TopPlayerItem").offsetHeight;
    const panelHeight = boardWidth + 2 * playerItemHeight;

    adjustLeftPanelSizes(panelHeight);
    adjustRightPanelSizes(panelHeight);
}

function scrollGameTextToCurrentMove() {
    let gt = document.getElementById("GameText");
    let scrollSize = Math.max(0, gt.scrollHeight * CurrentPly / Moves.length - gt.offsetHeight / 2);
    const changeThreshold = 0.15;
    if (Math.abs(scrollSize - gt.scrollTop) / gt.offsetHeight >  changeThreshold)
        gt.scrollTop = parseInt(scrollSize);
}

function customFunctionOnMove() {
    // Overriding the function from pgn4web.js that will run after each move

    // Display a dash if:
    // - there is no information about the clock, or
    // - moving to the first move (in order not to show actual times from PGN tags [{White,Black}Clock])
    let clockElemW = document.getElementById("GameWhiteClock");
    let clockElemB = document.getElementById("GameBlackClock");
    if (clockElemW.innerHTML.length < 1 || CurrentPly < 1)
            clockElemW.innerHTML = "-";
    if (clockElemB.innerHTML.length < 1 || CurrentPly < 2)
            clockElemB.innerHTML = "-";

    // Highlight current move in PGN window
    let highlightedMoveId = "Var0Mv" + String(CurrentPly);
    let currMove = document.getElementById(highlightedMoveId);
    if (currMove)
        currMove.classList.add("highlightMove");

    scrollGameTextToCurrentMove();
    updateResult();

    // Update engine evaluation
    useEngine();

    // Start clock countdown if enabled
    if (clockCountdownEnabled) {
        // Get reference time from pgn
        referenceTime = customPgnHeaderTag("ReferenceTime");

        // Remove `clockActive` if set from previous game
        document.getElementById("ClockPlace1").classList.remove("clockActive");
        document.getElementById("ClockPlace2").classList.remove("clockActive");

        if (clockCountdownTimer) {
            clearInterval(clockCountdownTimer);
            clockCountdownTimer = undefined;
        }

        checkLiveBroadcastStatus();

        if (LiveBroadcastGamesRunning > 0 && gameResult[currentGame] === '*' && CurrentPly === PlyNumber) {
            clockCountdown(true);
            clockCountdownTimer = setInterval(clockCountdown, 1000, false);
        }
    }
}

function selectPGN(filename) {
    // Setting PGN using one of the filenames defined in allPGNs array -
    //   small wrapper around SetPgnUrl which also restarts the broadcast.
    //   Returns true in case of success

    for (elem of allPGNs) {
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
        document.getElementById("CurrentPgnDownloadLink").href = pgnUrl;
        currentPGN = val;
        restartBroadcast();
    }
}

function modalOpen() {
    // Refres FEN and PGN values in the "share" modal
    let elemFEN = document.getElementById("FenInput");
    elemFEN.value = CurrentFEN();

    let elemPGN = document.getElementById("PgnInput");
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

    // Flip player scores
    let wsn = document.getElementById("ResultWhite");
    let bsn = document.getElementById("ResultBlack");
    document.getElementById("ResultPlace1").appendChild(IsRotated ? bsn : wsn);
    document.getElementById("ResultPlace2").appendChild(IsRotated ? wsn : bsn);

    // Flip player names
    let nameB = document.getElementById("GameBlack");
    let nameW = document.getElementById("GameWhite");
    document.getElementById("PlayerPlace1").appendChild(IsRotated ? nameB : nameW);
    document.getElementById("PlayerPlace2").appendChild(IsRotated ? nameW : nameB);

    // Flip country flags
    let flagB = document.getElementById("PlayerFlagBlack");
    let flagW = document.getElementById("PlayerFlagWhite");
    document.getElementById("PlayerPlace1").appendChild(IsRotated ? flagB : flagW);
    document.getElementById("PlayerPlace2").appendChild(IsRotated ? flagW : flagB);

    // Flip ratings
    let ratB = document.getElementById("GameBlackRating");
    let ratW = document.getElementById("GameWhiteRating");
    document.getElementById("RatingPlace1").appendChild(IsRotated ? ratB : ratW);
    document.getElementById("RatingPlace2").appendChild(IsRotated ? ratW : ratB);

    // Flip clocks
    let clkB = document.getElementById("GameBlackClock");
    let clkW = document.getElementById("GameWhiteClock");
    document.getElementById("ClockPlace1").appendChild(IsRotated ? clkB : clkW);
    document.getElementById("ClockPlace2").appendChild(IsRotated ? clkW : clkB);

    // Flip evaluation bar
    document.getElementById("EvaluationBarContainer").style.backgroundColor =
        IsRotated ? '#000' : '#fff';
    document.getElementById("EvaluationBar").style.backgroundColor = IsRotated ?  '#fff' : '#000';
    let oldHeight = document.getElementById("EvaluationBar").style.height.replace("%", "");
    document.getElementById("EvaluationBar").style.height = String(100 - Number(oldHeight)) + "%";

    FlipBoard();  // This will refresh all the default tags (GameWhite, GameWhiteClock etc)...
    adjustSquareSize(scaleOption); // ...and also mess up with piece image sizes, so we resize them
}

function fetchTranslations() {
    let htmlTranslateItem = document.getElementById("TranslateItem");
    let translateMenu = htmlTranslateItem.getElementsByClassName("dropdown-menu")[0];

    for (lang of supportedLanguages) {
        translationFile = "assets/translations/" + lang + ".json";
        let anchor = document.createElement("a");
        anchor.id = lang;
        anchor.innerHTML = lang;
        anchor.className = "dropdown-item";
        translateMenu.appendChild(anchor);

        fetch(translationFile)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("response status not ok");
                }
                return response.json();
            })
            .then((data) => {
                let isoCode = data["iso-639-code"]
                translations.set(isoCode, data);
                let anchor = document.getElementById(isoCode);
                anchor.innerHTML = data["langugage-name"];
                anchor.onclick = (evt) => {
                    translatePage(isoCode);
                };

                if (isoCode == currentLanguage)
                    translatePage(isoCode);
            })
            .catch((e) => {
                console.error(e);
            });
    }
}

function translatePage(languageIsoCode) {
    if (!translations.has(languageIsoCode))
        return;

    currentLanguage = languageIsoCode;
    localStorage.setItem("clint-language", currentLanguage)
    document.querySelectorAll("[translate-key]").forEach(
        (element) => { translateInnerText(element); });

    document.querySelectorAll("[translate-key-placeholder]").forEach(
        (element) => { translatePlaceholder(element); });
}

function translateInnerText(element) {
    // Caller should make sure that currentLanguage translations are available
    const translated = translations.get(currentLanguage);
    let key = element.getAttribute("translate-key");
    if (translated.hasOwnProperty(key))
        element.innerText = translated[key];
}

function translatePlaceholder(element) {
    // Caller should make sure that currentLanguage translations are available
    const translated = translations.get(currentLanguage);
    let key = element.getAttribute("translate-key-placeholder");
    if (translated.hasOwnProperty(key))
        element.placeholder = translated[key];
}

function getTranslation(key) {
    // Caller should make sure that currentLanguage translations are available
    return translations.get(currentLanguage)[key];
}

function hasTranslation(key) {
    return translations.has(currentLanguage) &&
           translations.get(currentLanguage).hasOwnProperty(key);
}

function fetchChessResultsPlayerData() {
    const chessResultsFile = "scripts/chess-results-flags";
    fetch(chessResultsFile)
        .then((response) => {
            if (!response.ok) {
                throw new Error("response status not ok");
            }
            return response.text();
        })
        .then((text) => {
            chessResultsPlayerData = text.split('\n');
            updatePlayerFlags();
        })
        .catch((e) => {
            console.error(e);
        });
}

//===========================================================
// Engine
//===========================================================

function initializeEngine() {

    engine = wasmSupported()
        ? new Worker("assets/js/stockfish.wasm.js")
        : new Worker("assets/js/stockfish.js");

    // Callback from engine
    engine.onmessage = function onmessage(event) {
        let msg = event.data;

        // Evaluation message from engine
        if (msg.indexOf("info depth") !== -1 &&
            msg.indexOf("lowerbound") == -1 &&
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
                    let san = game.move({
                        from: move.substring(0, 2),
                        to: move.substring(2, 4),
                        promotion: move.substring(4)
                    }).san;

                    // If black is to have the first move in the variation
                    if (moves == "" && game.turn() == "w")
                        moves += mvNum + "... ";

                    // We check if it is black to move, because a move was just played with the
                    //   game.move(...) function call
                    moves += (game.turn() == "b" ? mvNum + ". " : "") + san + " ";
                }
                catch (e) {
                    // Game has changed in the meantime, and the current FEN does not correspond
                    //   to the moves received in this event
                    return;
                }
            }

            // Score and depth
            let depth = tokens[2];
            let score;
            let barValue;

            let isCheckmate = msg.indexOf("mate") !== -1;
            if (isCheckmate) {
                score = Number(tokens[tokens.indexOf("mate") + 1]);
                barValue = score * 100;
            }
            else {
                // Centipawn loss (from engine's point of view)
                score = Number(tokens[tokens.indexOf("cp") + 1]) / 100.0;
                barValue = score;
            }

            if (toMove === "black") {
                score *= -1;
                barValue *= -1;
            }

            setEvaluationBarValue(barValue, false);
            score = (isCheckmate ? "#" : "") + String(score);
            setEngineAnnotations(moves, depth, score);
        }
    };
}

function setEngineAnnotations(line, depth, score) {
    if (!engineStatus)
        line = depth = score = "";

    if (depth) {
        document.getElementById("EngineNote").style.display = "none";
        document.getElementById("DepthLabel").style.display = "inline";
        document.getElementById("DepthValue").innerHTML = depth;
    }
    else {
        document.getElementById("EngineNote").style.display = "inline";
        document.getElementById("DepthLabel").style.display = "none";
        document.getElementById("DepthValue").innerHTML = "";
    }
    document.getElementById("EngineVariationDiv").innerHTML = line;
    document.getElementById("Score").innerHTML = score;
}

function setEvaluationBarValue(num, ignoreEngineStatus) {
    if (engineStatus || ignoreEngineStatus) {
        num *= IsRotated ? -1 : 1;
        num = Math.min(4, Math.max(-4, num));
        const newHeight = `${(((num + 4) / 8.0) * 100.0).toFixed(2)}%`;
        document.getElementById("EvaluationBar").style.height = newHeight;
    }
}

function useEngine() {
    if (!engine) {
        return "";
    }

    // Stop previous calculations and evaluate new position
    engine.postMessage("stop");
    setEngineAnnotations("...", "", "...");

    if (engineStatus) {
        // Analyze current position
        engine.postMessage("position fen " + CurrentFEN());
        // Get current side to move, so that engine lines can be displayed correctly
        toMove = document.getElementById("GameSideToMove").innerHTML;
        engine.postMessage(`go depth ${globalDepth}`);
    }
}

function toggleEngine() {
    engineStatus = Number(!engineStatus);
    let engineIcon = document.getElementById("EngineToggleIcon");
    engineIcon.className = engineStatus ? "fas fa-toggle-on" : "fas fa-toggle-off";

    if (engineStatus && !engine)
        initializeEngine();

    let variationDiv = document.getElementById("EngineVariationDiv");
    if (engineStatus) {
        variationDiv.style.display = "block";
    }
    else {
        setEvaluationBarValue(0, true);
        variationDiv.style.display = "none";
        setEngineAnnotations("", "", "");
    }

    useEngine();
}

function wasmSupported() {
    try {
        if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
            const wasmMagicWord = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
            const module = new WebAssembly.Module(wasmMagicWord);
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
    } catch (e) {}

    return false;
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

    if (e.target.id == "SearchInput" || e.target.id == "MultiboardSearchInput")
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

function hideSnackbarMessage() {
    let sb = document.getElementById("Snackbar");
    sb.className = sb.className.replace("show", "");

}

function removeSnackbarMessage() {
    numActiveSnackbarMessages = Math.max(0, numActiveSnackbarMessages - 1);

    if (!numActiveSnackbarMessages)
    {
        let sb = document.getElementById("Snackbar");
        sb.className = sb.className.replace("show", "");
    }
}

function snackbarMessage(translateKey) {
    let sb = document.getElementById("Snackbar");
    if (hasTranslation(translateKey)) {
        numActiveSnackbarMessages += 1;
        sb.innerHTML = getTranslation(translateKey);
        sb.className = "show";

        setTimeout(function() {
            removeSnackbarMessage();
        }, 2750);
    }
}

function setInlineNotation(value) {
    inlineNotationOption = value;
    let gameText = document.getElementById("GameText");

    if (inlineNotationOption) {
        gameText.classList.remove("lineFormNotation");
        localStorage.setItem("clint-notation", "inline");
    }
    else {
        gameText.classList.add("lineFormNotation");
        localStorage.removeItem("clint-notation");
    }

    scrollGameTextToCurrentMove();
}

function updateButtonHyperlinks(val) {
    // Update hyperlink references of buttons, if any are specified

    if (val >= 0 && val < allPGNs.length) {
        let links = allPGNs[val]["hyperlinks"];
        if (links != undefined) {
            for (const [key, value] of Object.entries(links)) {
                let anchor = document.getElementById(key);
                if (anchor && anchor.hasAttribute("href")) {
                    anchor.href = value;
                }
            }
        }
    }
}

function prettifyGameResult(res) {
    if (res == "1/2")
        return charOneHalf;

    if (res == "1" || res == "0")
        return res;

    return charStar;
}

function customFunctionOnPgnTextLoad() {
    // Overriding the function from pgn4web.js that will run after loading a PGN

    if (!started) {
        // Code in this block exectues only once
        started = true;
        document.getElementById("CurrentPgnDownloadLink").href = pgnUrl;

        // customFunctionOnPgnTextLoad() is called at the end of createBoard() in pgn4web.js
        //   which is in turn trigerred by start_pgn4web() on startup. We hook to this chain
        //   by immediately changing the game to the one defined in the URL parameter, if any.
        if (url.has("game"))
            changeGame(url.get("game"));

        // Set up round select menu (for single- and multi-board view)
        let selectRoundElem = document.getElementById("PgnFileSelect");
        let mbSelectRoundElem = document.getElementById("MultiboardFileSelect");
        let now = new Date();

        for (let i = 0; i < allPGNs.length; ++i) {
            let option = document.createElement("option");
            option.value = String(i);

            if (allPGNs[i]["name"])
                option.innerHTML = allPGNs[i]["name"];
            else
                option.innerHTML = "Unknown PGN";

            // If the round will start at later point in time, disable its selection
            if (allPGNs[i]["date"] &&
                new Date(allPGNs[i]["date"].getTime() - minsBeforeRound * 60000) > now) {
                option.disabled = true;
            }

            if (allPGNs[i]["id"]) {
                option.setAttribute("translate-key", allPGNs[i]["id"]);
                if (translations.has(currentLanguage))
                    translateInnerText(option);
            }

            selectRoundElem.appendChild(option);
            mbSelectRoundElem.appendChild(option.cloneNode(true));
        }
    }

    // Update of options in "select game" grid area
    let gameSel = document.getElementById("GameSelectionDiv");

    // Delete all options
    while (gameSel.childElementCount > 0) {
        gameSel.removeChild(gameSel.lastChild);
    }

    // (Re)generate the game selection menu
    const videoBoards = allPGNs[currentPGN]["video-boards"];
    const hasVideoBoards = Boolean(videoBoards);

    for (let i = 0; i < numberOfGames; ++i) {
        let optionDiv = document.createElement("div");
        optionDiv.className = "row m-0";
        optionDiv.onclick = (evt) => {
            changeGame(i);
            highlightSelectedGame();
        };

        let boardNumber = document.createElement("span");
        boardNumber.className = "col-1";
        boardNumber.innerHTML = String(i + 1);

        const hasThisBoardVideo = hasVideoBoards && i < videoBoards.length;

        let players = document.createElement("span");
        players.className = "col-" + (hasThisBoardVideo ? "8" : "10");
        let spanPlayerWhite = document.createElement("span");
        let spanPlayerBlack = document.createElement("span");
        spanPlayerWhite.innerHTML = gameWhite[i];
        spanPlayerBlack.innerHTML = gameBlack[i];
        players.appendChild(spanPlayerWhite);
        players.appendChild(document.createElement("br"));
        players.appendChild(spanPlayerBlack);

        let results = document.createElement("span");
        results.className = "col-1";
        let spanResultWhite = document.createElement("span");
        let spanResultBlack = document.createElement("span");
        const gameResults = gameResult[i].split("-");
        if (gameResults.length == 2) {
            spanResultWhite.innerHTML = prettifyGameResult(gameResults[0]);
            spanResultBlack.innerHTML = prettifyGameResult(gameResults[1]);
        }
        results.appendChild(spanResultWhite);
        results.appendChild(document.createElement("br"));
        results.appendChild(spanResultBlack);

        let camera;
        if (hasThisBoardVideo) {
            camera = document.createElement("button");
            camera.className = "col-2 btn btn-custom";
            const icon = document.createElement("i");
            icon.className = "fas fa-video";
            camera.appendChild(icon);
            camera.onclick = (evt) => {
                enableVideoDiv("VideoDivLeft", videoBoards[i]);
                // Update color of active camera
                let query = document.querySelector("#GameSelectionDiv button.active");
                if (query !== null) {
                    query.classList.remove("active");
                }
                event.currentTarget.classList.add("active");
            };
        }

        optionDiv.appendChild(boardNumber);
        optionDiv.appendChild(players);
        if (camera) {
            optionDiv.appendChild(camera);
        }
        optionDiv.appendChild(results);

        gameSel.appendChild(optionDiv);
    }

    highlightSelectedGame();

    // Keep active the input from the game search bar
    applyGameSelectionFilters();

    // Update the video / image, if any is specified
    let video_left = allPGNs[currentPGN]["video-left"];
    let video_right = allPGNs[currentPGN]["video-right"];

    if (video_left != undefined)
        enableVideoDiv("VideoDivLeft", video_left);
    else
        disableVideoDiv("VideoDivLeft");

    if (video_right != undefined)
        enableVideoDiv("VideoDivRight", video_right)
    else
        disableVideoDiv("VideoDivRight");

    let image_left = allPGNs[currentPGN]["image-left"],
        image_right = allPGNs[currentPGN]["image-right"];

    if (image_left != undefined)
        enableImageDiv("ImageDivLeft", image_left);
    else
        disableImageDiv("ImageDivLeft");

    if (image_right != undefined)
        enableImageDiv("ImageDivRight", image_right);
    else
        disableImageDiv("ImageDivRight");

    updateButtonHyperlinks(currentPGN);
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
    let scrollSize = Math.max(0, gameSel.scrollHeight * currentGame / numberOfGames -
                              gameSel.offsetHeight / 2);
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
}

function enableVideoDiv(divId, link) {
    let videoDiv = document.getElementById(divId);
    if (videoDiv == null)
        return;

    videoDiv.style.display = "";
    if (videoDiv.children.length && videoDiv.children[0].src != link)
        videoDiv.children[0].src = link;
}

function disableImageDiv(divId) {
    let imageDiv = document.getElementById(divId);
    if (imageDiv == null)
        return;

    imageDiv.style.display = "none";
    if (imageDiv.children.length)
        imageDiv.children[0].src = "";
}

function enableImageDiv(divId, link) {
    let imageDiv = document.getElementById(divId);
    if (imageDiv == null)
        return;

    // Check if `link` is already set up in the current image div
    if (imageDiv.children.length && imageDiv.firstChild.src == link)
        return;

    // Remove previous image(s)
    while (imageDiv.firstChild)
        imageDiv.removeChild(imageDiv.lastChild);

    // Replace it with a new image
    let img = new Image();
    img.src = link;

    imageDiv.appendChild(img);
    imageDiv.style.display = "";
}

function filterSearchInputGames() {
    let searchElementId = "";
    let gameSelectionDivId = "";
    let whitePlayers = Array();
    let blackPlayers = Array();

    if (viewType == 0) {
        searchElementId = "SearchInput";
        gameSelectionDivId = "GameSelectionDiv";
        whitePlayers = gameWhite;
        blackPlayers = gameBlack;
    }
    else {
        searchElementId = "MultiboardSearchInput";
        gameSelectionDivId = "GamesSelectionContainer";
        let frame0 = document.getElementById("Frame0");
        whitePlayers = frame0.contentWindow.gameWhite;
        blackPlayers = frame0.contentWindow.gameBlack;
    }

    let search = document.getElementById(searchElementId);
    let value = search.value.toLowerCase();
    let gameSelectionDiv = document.getElementById(gameSelectionDivId);

    if (!whitePlayers || !blackPlayers ||
        gameSelectionDiv.children.length != whitePlayers.length ||
        gameSelectionDiv.children.length != blackPlayers.length)
        return new Set();

    let filteredGames = setWithIncreasingValues(whitePlayers.length);

    for (let i = 0; i < gameSelectionDiv.children.length; ++i)
    {
        if (!whitePlayers[i].toLowerCase().includes(value) &&
            !blackPlayers[i].toLowerCase().includes(value))
            filteredGames.delete(i);
    }

    return filteredGames;
}

//===========================================================
// Multiple board view
//===========================================================
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
        frame.id = "Frame" + String(i);
        frame.src = "mosaic-tile.html";
        frame.style.display = "none";

        // Set the alternative theme if needed
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

        // `numberMiniboards` games will now be displayed, so resize all the miniboards.
        //   For instance, if the number of prevously displayed boards was < `numberMiniboards`,
        //   those boards's had >= dimensions
        maximizeIframesTiles(controlPanelOption);

        // Change PGN for all miniboards
        let newPgnUrl = allPGNs[val]["pgn"];
        let iframesDiv = document.getElementById("IframesContainer");
        let iframes = iframesDiv.querySelectorAll("iframe");
        for (let i = 0; i < iframes.length; i++) {
            iframes[i].style.display = "";
            iframes[i].contentWindow.changePgn(newPgnUrl);
        }
    }

    // Update custom per-PGN button links
    updateButtonHyperlinks(val);
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

    for (let i = 0; i < iframes.length; i++) {
        iframes[i].contentWindow.toggleHighlight();
    }
}

function updateGameSelectionModalOnFirstIframeLoaded() {
    document.getElementById("MaxSelected").innerHTML = numberMiniboards;
    document.getElementById("CountSelected").innerHTML = chosenGames.length;

    // Clear old modal content
    let optionsDiv = document.getElementById("GamesSelectionContainer");
    while (optionsDiv.firstChild) {
        optionsDiv.removeChild(optionsDiv.lastChild);
    }

    // Information about all games in PGN file
    let frame0 = document.getElementById("Frame0");
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
        result.innerHTML = results[i].split("1/2").join(charOneHalf);
        let checkboxDiv = document.createElement("div");
        checkboxDiv.className = "col-2";
        let checkbox = document.createElement("input");
        checkbox.className = "position-static";
        checkbox.type = "checkbox";
        checkbox.value = String(i);
        checkbox.addEventListener("click", handleGameSelectionModalCheckboxClick);
        if (chosenGames.includes(i)) {
            checkbox.checked = true;
        }

        checkboxDiv.appendChild(checkbox);
        option.appendChild(game);
        option.appendChild(result);
        option.appendChild(checkboxDiv);
        optionsDiv.appendChild(option);
    }

    applyGameSelectionFilters();
}

function onGameSelectionModalSave() {
    // Reorder games chosen for display
    chosenGames.sort(function(a,b){ return a-b; });

    // Render chosen games in order of appearing in the PGN file
    let iframesDiv = document.getElementById("IframesContainer");
    let iframes = iframesDiv.querySelectorAll("iframe");
    for (let i = 0; i < chosenGames.length; i++) {
        iframes[i].style.display = "";
        iframes[i].contentWindow.changeGame(chosenGames[i]);
    }

    for (let i = chosenGames.length; i < iframes.length; ++i) {
        iframes[i].style.display = "none";
    }

    // Scroll modal games list to top
    document.getElementById("GamesSelectionContainer").scrollTop = 0;

    // Maximize board sizes according to selected number of games to display
    maximizeIframesTiles(controlPanelOption);

    // Restart live broadcast
    restartBroadcast();
}

function handleGameSelectionModalCheckboxClick(evt) {
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
        document.getElementById("MultiboardSaveBtn").disabled = true;
    }
    else {
        chosenCount.style.setProperty("color", "");
        document.getElementById("MultiboardSaveBtn").disabled = false;
    }
}

function filterOngoingGames() {
    let frame0 = document.getElementById("Frame0");
    let results = frame0.contentWindow.gameResult;
    let gameSelectionDiv = document.getElementById("GamesSelectionContainer");
    let ongoing = document.getElementById("MultiboardOngoingCheckbox");

    if (!results || gameSelectionDiv.children.length != results.length)
        return new Set();

    let filteredGames = setWithIncreasingValues(results.length);

    for (let i = 0; i < gameSelectionDiv.children.length; ++i) {
        let game = gameSelectionDiv.children[i];
        if (ongoing.checked && results[i] != "*")
            filteredGames.delete(i);
    }

    return filteredGames;
}

function gameSelectionModalSelectAllCheckbox(evt) {
    let gameSelectionDiv = document.getElementById("GamesSelectionContainer");
    for (let i = 0; i < gameSelectionDiv.children.length; ++i) {
        let game = gameSelectionDiv.children[i];
        if (game.style.display != "none" && game.children.length >= 3) {
            let checkbox = game.children[2].firstChild;
            if (checkbox && checkbox.checked != evt.checked)
                checkbox.click();
        }
    }
}

function resetGameSelectionFiltering() {
    let search = document.getElementById("MultiboardSearchInput");
    search.value = "";
    let ongoing = document.getElementById("MultiboardOngoingCheckbox");
    ongoing.checked = false;
    let selectAll = document.getElementById("MultiboardSelectAllCheckbox");
    selectAll.checked = false;
}

function applyGameSelectionFilters() {
    let filteredGames = []
    let gameSelectionDivId = "";

    if (viewType == 0) {
        gameSelectionDivId = "GameSelectionDiv";
        let f1 = filterSearchInputGames()
        filteredGames = Array.from(f1)
    }
    else {
        gameSelectionDivId = "GamesSelectionContainer";
        let f1 = filterSearchInputGames()
        let f2 = filterOngoingGames();
        filteredGames = [...f1].filter(i => f2.has(i))
    }

    let gameSelectionDiv = document.getElementById(gameSelectionDivId);
    for (let i = 0; i < gameSelectionDiv.children.length; ++i) {
        if (filteredGames.includes(i))
            gameSelectionDiv.children[i].style.setProperty("display", "");
        else
            gameSelectionDiv.children[i].style.setProperty("display", "none");
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
    // https://stackoverflow.com/q/3437786
    let height = window.innerHeight ||
                 document.documentElement.clientHeight ||
                 document.body.clientHeight;

    // Note: if there are fewer than 3 boards, these boards will be maximized on the screen
    let gamesPerRow = Math.min(3, chosenGames.length);

    if (width < 768)
        gamesPerRow = 2;

    if (width < 576)
        gamesPerRow = 1;

    // Variant for smaller devices (scrolling needed to see other boards)
    let size = parseInt(.975 * width / gamesPerRow);

    if (width >= 768) {
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

    for (let i = 0; i < chosenGames.length; i++) {
        iframes[i].width = size;
        iframes[i].height = size + additional;
        iframes[i].contentWindow.adjustBoardSize(resize);
    }
}

function toggleView(ind) {
    // Change from single to multiple board view or vice versa
    viewType = ind;

    if (ind == 0) {
        // Change to single board view
        document.getElementById("MultiBoardView").style.display = "none";
        document.getElementById("SingleBoardView").style.display = "";
        localStorage.removeItem("clint-view");
    }
    else {
        // Change to multiple boards view
        document.getElementById("MultiBoardView").style.display = "";
        document.getElementById("SingleBoardView").style.display = "none";
        localStorage.setItem("clint-view", "multiple-boards")
        // Turn off engine
        if (engineStatus)
            toggleEngine();

        SetAutoPlay(false);
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
    if (currTheme != "alternative") {
        bodies[0].setAttribute("data-theme", "alternative");
        localStorage.setItem("clint-theme", "alternative");
    }
    else {
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

        if (currTheme == "alternative")
            iframeBodies[0].setAttribute("data-theme", "alternative");
        else
            iframeBodies[0].setAttribute("data-theme", "");
    }
}

// Variable saving the value returned by setTimeout(...)
let resizeTimeout;
function resizeEnd() {
    if (viewType == 0) {
        adjustSquareSize(scaleOption);
    }
    else {
        maximizeIframesTiles(controlPanelOption);
    }
}

function resizeCallback() {
    // Trigger one resize action by callbacks after a 50 ms break;
    //   this prevents spamming of the resize functionality
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeEnd, 50);
}

// Frame0 will send messages when it changes it's PGN so the "select game" modal can be updated
window.addEventListener("message", receiveMessage, false);

function receiveMessage(evt) {
    let target = location.protocol + "//" +
                 location.hostname + (location.port.length > 0 ? ":" + location.port : "");
    if (evt.origin !== target) {
        return;
    }

    if (evt.data.includes("PgnTextLoaded")) {
        updateGameSelectionModalOnFirstIframeLoaded();

        if (evt.data.includes("NewGame")) {
            resetGameSelectionFiltering();
        }
    }

    if (evt.data.includes("Frame") && evt.data.includes("Ready")) {
        let ind = String(evt.data.substr(5,1));
        iframesLoaded[ind] = 1;

        // If all iframes are loaded, load first PGN file
        if (iframesLoaded.reduce((a, b) => a + b) == numberMiniboards) {
            changeFramesPGN(0);
        }
    }
}
