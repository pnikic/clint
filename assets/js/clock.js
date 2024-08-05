//===========================================================
// Global variables - don't edit
//===========================================================
let clockCountdownTimer = undefined;
let referenceTime = undefined; // Datetime when last clock state was saved in pgn

//===========================================================
// Clock
//===========================================================
function clockCountdown(isFirstUpdate) {
    // TODO: make this agnostic from PGN tag Reference time
    // DGT Livechess always puts this tag in live games .pgn files
    // It has the following format: `<B|W>/<datetime in ISO format>`
    const sideToMove = (PlyNumber % 2) === 0;
    let lastRefreshed = undefined;

    if (referenceTime) {
        lastRefreshed = new Date(referenceTime.slice(2));
    }
    else {
        // Fallback if `referenceTime` is undefined - poor alternative since it doesn't
        // take into account that last received PGN perhaps didn't update current game
        lastRefreshed = new Date(LiveBroadcastLastReceivedLocal);
    }

    const now = new Date();
    const delayOffsetMs = broadcastDelayMins * 60 * 1000;
    const timeElapsed = now - delayOffsetMs - lastRefreshed;
    const activeClk = document.getElementById(sideToMove ? "GameWhiteClock" : "GameBlackClock");
    const inactiveClk = document.getElementById(!sideToMove ? "GameWhiteClock" : "GameBlackClock");
    const clockStringRegExp = new RegExp("(\\d+):(\\d+):(\\d+)");

    if (clkMatch = activeClk.innerHTML.match(clockStringRegExp)) {
        const h = parseInt(clkMatch[1]);
        const m = parseInt(clkMatch[2]);
        const s = parseInt(clkMatch[3]);
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
