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
    //     "pgn"         : <string>,
    //     "id"          : <string>,
    //     "date"        : <JavaScript Date object>,
    //     "video-left"  : <string>,
    //     "video-right" : <string>,
    //     "image-left"  : <string>,
    //     "image-right" : <string>,
    //     "hyperlinks"  : <JavaScript object>
    // });
    //
    // +-------------+---------------+------------------------------------------------------------+
    // | Optionality |      Key      |                         Description                        |
    // +-------------+---------------+------------------------------------------------------------+
    // |   required  |     "pgn"     | path to the PGN file                                       |
    // +-------------+---------------+------------------------------------------------------------+
    // |   required  |      "id"     | used to define label displayed in the game selection       |
    // |             |               | dropdown menu for each language JSON file;                 |
    // |             |               | it's the operator's task to ensure that all PGN files have |
    // |             |               | translations for all languages                             |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  |     "date"    | start date and time; used to disable selection of upcoming |
    // |             |               | rounds (see also the variable `minsBeforeRound`)           |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  | "video-left"  | link to a video to be displayed on the left-hand side      |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  | "video-right" | link to a video to be displayed on the right-hand side     |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  |  "image-left" | link to an image to be displayed on the left-hand side     |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  | "image-right" | link to an image to be displayed on the right-hand side    |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  |  "hyperlinks" | object which assigns custom hyperlink targets per round;   |
    // |             |               | it's the operator's task to ensure that all PGN files have |
    // |             |               | values for all custom buttons. If a value for a button is  |
    // |             |               | not defined for a PGN file, the button keeps its old value |
    // |             |               | (before changing the PGN file)                             |
    // +-------------+---------------+------------------------------------------------------------+
    //
    // See below for examples

    let begin;  // A variable which will be re-used in this function

    // To generate JavaScript Date object the following function can be used:
    //   dateFromArray([Year, Month, Day, Hour, Minute])
    //
    // Note: In this example, on each round (PGN file) we will have a different target for two
    //   hyperlinks (i.e. `chess-results-link` and `custom-button`). Hyperlinks (buttons) with a
    //   fixed target are configured below. See variable `footerLinks` in `operatorSettings()`.
    //
    // Example 1: video on the left and image on the right;  presence of "date" parameter disables
    //   selection of this round a number of minutes (`minsBeforeRound`) before its start
    //
    // Translation text for this round is specified in each JSON file using their "id".
    // e.g. in file: en.json
    // {
    //     "round-1"       : "Round 1 - Nov 10th 15:00",
    //     ...
    // }
    begin = dateFromArray([2020, 11, 10, 15, 0]);
    allPGNs.push({
        "pgn" : "pgn/r1.pgn",
        "id" : "round-1",
        "date" : begin,
        "video-left" : "https://www.youtube.com/embed/4jT0hUODzdQ",
        "image-right" : "https://tinyurl.com/y73a4vrz",
        "hyperlinks" : {
            "chess-results-link" : "https://www.example.com/a1",
            "custom-button" : "https://www.example.com/b1"
        }
    });

    // Example 2: only image on the right
    begin = dateFromArray([2020, 11, 11, 15, 0]);
    allPGNs.push({
        "pgn" : "pgn/r2.pgn",
        "id" : "round-2",
        "date" : begin,
        "image-right" : "https://tinyurl.com/yc93gdrk",
        "hyperlinks" : {
            "chess-results-link" : "https://www.example.com/a2",
            "custom-button" : "https://www.example.com/b2"
        }
    });

    // Example 3: neither video nor image on any side
    begin = dateFromArray([2020, 11, 12, 9, 30]);
    allPGNs.push({
        "pgn" : "pgn/r3.pgn",
        "id" : "round-3",
        "date" : begin,
        "hyperlinks" : {
            "chess-results-link" : "https://www.example.com/a3",
            "custom-button" : "https://www.example.com/b3"
        }
    });

    // Example 4: abscence of the "date" parameter implies this PGN can be opened anytime
    allPGNs.push({
        "pgn" : "pgn/all.pgn",
        "id" : "all-rounds",
        "hyperlinks" : {
            "chess-results-link" : "https://www.example.com/a0",
            "custom-button" : "https://www.example.com/b0"
        }
    });
}

function operatorSettings() {
    // Targets for PGN download buttons
    document.getElementById("AllPgnDownloadLink").href = "pgn/all.pgn";

    // To enable a (fixed) video / live stream link for all rounds use:
    // enableVideoDiv("VideoDivLeft", "https://www.youtube.com/embed/<your-code>");
    // enableVideoDiv("VideoDivRight", "https://www.youtube.com/embed/<your-code>");

    // ...or image for all rounds:
    // enableImageDiv("ImageDivLeft", "<link-to-image>");
    // enableImageDiv("ImageDivRight", "<link-to-image>");

    let footerLinks = [];
    // List all the footer hyperlinks. Footer will not be displayed if an empty list is provided.
    // The format is as follows:
    //
    // footerLinks.push({
    //     "id"      : <string>,
    //     "link"    : <string>,
    //     "fa-icon" : <string>,
    //     "size"    : <JavaScript Array> (5 elements)
    // });
    //
    // +-------------+---------------+------------------------------------------------------------+
    // | Optionality |      Key      |                         Description                        |
    // +-------------+---------------+------------------------------------------------------------+
    // |   required  |      "id"     | "id" attribute of the HTML element. Used for               |
    // |             |               | 1) label of the button (displayed text) for each language  |
    // |             |               | 2) "hyperlinks" option in `allPGNs`                        |
    // +-------------+---------------+------------------------------------------------------------+
    // |   required  |     "link"    | hyperlink reference (e.g. URI) of the button               |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  |   "fa-icon"   | font-awesome class of the icon displayed near the button;  |
    // |             |               | you can choose one from:                                   |
    // |             |               | https://fontawesome.com/icons?d=gallery&m=free             |
    // +-------------+---------------+------------------------------------------------------------+
    // |   optional  |     "size"    | bootstrap grid breakpoint sizes for buttons - five values: |
    // |             |               | [a, b, c, d, e], where                                     |
    // |             |               | a = width for extra small screens (<576px),                |
    // |             |               | b = width for small screens       (>=576px),               |
    // |             |               | c = width for medium screens      (>=768px),               |
    // |             |               | d = width for large screens       (>=992px),               |
    // |             |               | e = width for extra large screens (>=1200px).              |
    // |             |               |                                                            |
    // |             |               | values range from 1 (small) to 12 (big, full row) button   |
    // |             |               | default values are [12, 6, 4, 3, 2]                        |
    // +-------------+---------------+------------------------------------------------------------+
    //
    // See below for examples

    // Examples 1 & 2: for these elements, "link" will be provided from `allPGNs` using their "id"
    //
    // Translation texts for these elements are specified in each JSON file using their "id".
    // e.g. in file: en.json
    // {
    //     "custom-button"       : "Translation of custom button",
    //     "chess-results-link"  : "Results and standings",
    //     ...
    // }
    //
    // Note: It's the operator's task to ensure that a footer link has translations for all
    //       languages. If translation for one language is not defined for a footer link,
    //       the link keeps its old name (before changing the language).

    footerLinks.push({
        "id"   : "custom-button",
        "link" : ""
    });

    footerLinks.push({
        "id"   : "chess-results-link",
        "link" : ""
    });

    // Example 3: footer link with FA icon
    footerLinks.push({
        "id"   : "photo-gallery-link",
        "link" : "https://www.example.com",
        "fa-icon" : "fas fa-images"
    });

    // Examples 4 & 5: this button is smaller on extra large screens. The next button is
    //   bigger (more text). The numbers are chosen so that the full xl-row sums up to 12.
    //   Target for any button can also be a local file (from the server).
    footerLinks.push({
        "id"   : "invitation-link",
        "link" : "https://www.example.com",
        "size" : [12, 6, 6, 4, 1],
    });

    // Operator's contact button
    footerLinks.push({
        "id"   : "email-link",
        "link" : "mailto:" + "operator@mailserver.com",
        "size" : [12, 6, 6, 4, 3],
        "fa-icon" : "fas fa-envelope"
    });

    // Example 6: Link to clint GitHub page
    footerLinks.push({
        "id" : "clint-link",
        "link" : "https://www.github.com/pnikic/clint",
        "fa-icon" : "fab fa-github"
    });

    generateFooterLinks(footerLinks);
}

//----------------------------------------------------------
// General
//----------------------------------------------------------
// Path to /images folder of pgn4web
SetImageType("svg");
SetImagePath("../pgn4web-3.06/images/svgchess");

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
SetLiveBroadcast(.25, false, false, true, false);

// Set this to false if you want to disable clock countdown
let clockCountdownEnabled = true;

// Set this to number of minutes broadcast is delayed (i.e. 0 if no delay, 15 for 15 minutes delay)
// This is needed for clock countdown adjustment
let broadcastDelayMins = 0;

// List of languages to be loaded. Make sure to update all translations in corresponding JSON files
let supportedLanguages = [
    "en",  // English
    "hr"   // Hrvatski (Croatian)
];

//----------------------------------------------------------
// Single board view
//----------------------------------------------------------
// Set the game to be displayed on first or last move based on first argument: "start" or "end".
// This function call is only relevant for startup. Otherwise check the changePGN(...) function
SetInitialHalfmove("end", true);

// Number of minutes before the round start for enabling current round selection
let minsBeforeRound = 45;

// Maximum expected duration of a round. Used for automatically choosing the initial PGN file to
//   be opened. Example: for classical time control 90+30, you could consider the round over
//   e.g. 120 minutes after both players (thus "2 *") used their clock time.
let expectedRoundDuration = 2 * (90 + 30) + 120; // minutes

// Set this to true if you want to disable pgn4web's removal of "aesthetic characters"(x, +, =)
//   from PGN moves notation (e.g. if set to `true` you could see "Nxe2+", if `false` just "Ne2")
let useAestheticNotation = false;

//----------------------------------------------------------
// Multiple boards view
//----------------------------------------------------------
let numberMiniboards = 6;
// Note: For more boards, `gamesPerRow` can be changed in `maximizeIframesTiles` of setup.js

