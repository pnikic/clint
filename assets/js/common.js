const charStar = "✻";
const charOneHalf = "½";
const charNonBreakableSpace = "\xa0";

function updateResult() {
    let resultElem = document.getElementById("GameResult");
    let resultBlack = document.getElementById("ResultBlack");
    let resultWhite = document.getElementById("ResultWhite");
    let res = resultElem.innerHTML;

    if (res == "1/2-1/2") {
        resultBlack.innerHTML = resultWhite.innerHTML = charOneHalf;
    }
    else if (res == "1-0" || res == "0-1") {
        resultWhite.innerHTML = res[0];
        resultBlack.innerHTML = res[2];
    }
    else {
        resultBlack.innerHTML = resultWhite.innerHTML = charStar;
    }
}

function isSmallScreen() {
    return window.innerWidth <= 799;
}

function isMediumScreen() {
    return window.innerWidth > 799 && window.innerWidth <= 1259;
}
