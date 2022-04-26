//===========================================================
// Global variables - don't edit
//===========================================================
let clockCountdownTimer = undefined;
let referenceTime = undefined; // Datetime when last clock state was saved in pgn


function clockCountdown(isFirstUpdate) {
    // TODO: make this agnostic from PGN tag Reference time
    // DGT Livechess always puts this tag in live games .pgn files
    // It has following format: `<B|W>/<datetime in ISO format>`
    let sideToMove = (PlyNumber % 2) === 0;
    let lastRefreshed = undefined;

    if (referenceTime) {
        lastRefreshed = new Date(referenceTime.slice(2));
    } else {
        // Fallback if `referenceTime` is undefined - poor alternative
        lastRefreshed = new Date(LiveBroadcastLastReceivedLocal);
    }

    let now = new Date();
    let timeElapsed = now - lastRefreshed;
    let activeClk = document.getElementById(sideToMove ? "GameWhiteClock" : "GameBlackClock");
    let inactiveClk = document.getElementById(!sideToMove ? "GameWhiteClock" : "GameBlackClock");
    let clockStringRegExp = new RegExp("(\\d+):(\\d+):(\\d+)");

    if (clkMatch = activeClk.innerHTML.match(clockStringRegExp)) {
        let h = parseInt(clkMatch[1]),
            m = parseInt(clkMatch[2]),
            s = parseInt(clkMatch[3]);
        let clockTime = new Date((new Date()).setHours(h, m, s) - (isFirstUpdate ? timeElapsed : 1000));
        let clockZero = new Date(new Date().setHours(0, 0, 0));

        if (clockTime < clockZero) {
            clockTime = clockZero;
        }

        activeClk.innerHTML = clockTime.toLocaleTimeString("hr");
        activeClk.parentElement.classList.add("clockActive");
        inactiveClk.parentElement.classList.remove("clockActive");
    }
}