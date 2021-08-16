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
    //     "image-left" : <string>,
    //     "image-right" : <string>,
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
    //   (optional) - "image-left" is a link to an image to be displayed on the left-hand side
    //   (optional) - "image-right" is a link to an image to be displayed on the right-hand side
    //   (optional) - "hyperlinks" is an object which assigns custom hyperlink targets for buttons
    //                   Note: It's the operator's task to ensure that all PGN files have values for
    //                         all custom buttons. If a value for a button is not defined for a PGN
    //                         file, the button keeps its old value (before changing the PGN file)
    //
    // See below for examples

    let begin;  // A variable which will be re-used in this function

    // To generate JavaScript Date object the following function can be used:
    //   dateFromArray([Year, Month, Day, Hour, Minute])
    begin = dateFromArray([2020, 11, 10, 15, 00])
    allPGNs.push({
        "name" : "1. kolo - " + dateToString(begin),
        "pgn" : "pgn/r1.pgn",
        "date" : begin,
        "video-left" : "https://www.youtube.com/embed/4jT0hUODzdQ",
        "image-right" : "https://tinyurl.com/y73a4vrz",
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
        "image-right" : "https://tinyurl.com/yc93gdrk",
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
         "video-right" : "https://www.youtube.com/embed/mcnK9zx3Rng",
         "image-left" : "https://tinyurl.com/ya3g25ck",
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
}

function operatorSettings() {
    // PGN download buttons
    document.getElementById("currLink").href = pgnUrl;         // current active pgn
    document.getElementById("allLink").href = "pgn/all.pgn";   // all rounds

    // To enable a (fixed) live stream / video for all rounds use:
    // enableVideoDiv("VideoDivLeft", "https://www.youtube.com/embed/<your-code>");
    // enableVideoDiv("VideoDivRight", "https://www.youtube.com/embed/<your-code>");

    // ...or image for all rounds:
    // enableImageDiv("ImageDivLeft", "<link-to-image>");
    // enableImageDiv("ImageDivRight", "<link-to-image>");

    let footerLinks = [];
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

// Maximum expected duration of a round. Used for automatically choosing the initial PGN file to
//   be opened. Example: for classical time control 90+30 (for both players, thus "2 *"), you could
//   consider the round over 120 minutes after both players used their expected time.
let expactedRoundDuration = 2 * (90 + 30) + 120; // minutes

// Set this to true if you want to disable pgn4web's removal of "aesthetic characters"(x, +, =)
//   from PGN moves notation (e.g. if set to `true` you could see "Nxe2+", if `false` just "Ne2")
let useAestheticNotation = false;

//----------------------------------------------------------
// Multiple boards view
//----------------------------------------------------------
let numberMiniboards = 6;

