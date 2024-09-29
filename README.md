# clint - chess live interface
clint is a complete website for live broadcasting of a chess tournament based on [pgn4web][2]. It is inspired by many chess websites and strives to offer their best functionalities to any chess broadcast operator. It can also be used simply as a viewer for PGN files.

Single board view | Multiple boards view | Mobile view
:---:|:---:|:---:
![interface screenshot][1a] | ![interface screenshot][1b] | ![interface screenshot][1c]

Check out the [demo page][6] to see clint in action.

Support this project with a donation via [PayPal][8].
Check out the [contribute](https://github.com/pnikic/clint#contribute) section.

### Table of contents
* [Usage](https://github.com/pnikic/clint#usage)
    + [Setup](https://github.com/pnikic/clint#setup)
    + [Customization](https://github.com/pnikic/clint#customization)
* [Notes](https://github.com/pnikic/clint#notes)
    + [Credits and license](https://github.com/pnikic/clint#credits-and-license)
    + [Deployments](https://github.com/pnikic/clint#deployments)
    + [Future work](https://github.com/pnikic/clint#future-work)
    + [Contribute](https://github.com/pnikic/clint#contribute)


### Features
* Header with general information (about the tournament) including navbar with customizable hyperlinks
* Chess board with compactly displayed player names, ratings and clock times
* Display player's federation flag and information about opponents from previous rounds
* PGN section for display and navigation
* Engine analysis
* Switching between different games and PGN files (rounds) on the same page
* Support for embedding video (live stream) or image for each PGN file (round)
* Placeholder for custom content on both sides of the board
* Download PGN / FEN, share link to a specific game, link to analyze position in lichess
* Multiple boards view (e.g. 6 boards)
* Responsive design - mobile phone friendly
* Full color customization support, predefined light and dark theme
* Translation to multiple languages

## Usage
### Setup
* Clone this repository on your web server
* Download [pgn4web][2] on your web server
    
    Example folder structure:
    ```text
    web-server
    ├── clint
    │   ├── index.html
    │   ├── assets
    │   ├── (...)
    ├── pgn4web-3.06
    │   ├── pgn4web.js
    │   ├── images
    │   ├── (...)
    └── 
    ```
    <details>
    <summary>Note: To reduce storage space, it's possible to only store the following files from pgn4web <i>(click to expand note)</i></summary>  

    * `pgn4web-x.yz/pgn4web.js`
    * folder with selected image assets _(e.g._ `pgn4web-x.yz/images/svgchess`_)_
    * selected chess figurines font _(e.g. all files from_ `pgn4web-x.yz/fonts/` _containing_ `ChessSansPiratf` _in the file name)_

    Clint doesn't use other files from pgn4web. See the following paragraph for setting the paths to these files.
    </details>

* Edit the `pgn4web.js` path and the fonts path in `index.html` and in `mosaic-tile.html`  
(in this case, pgn4web-3.06 is placed one directory up)
    ```html
    <script src="../pgn4web-3.06/pgn4web.js" defer></script>
    ...
    <link rel="stylesheet" type="text/css" href="../pgn4web-3.06/fonts/pgn4web-font-ChessSansPiratf.css">
    ```
    and the image path for the pieces in `assets/js/config.js`
    ```javascript
    SetImagePath("../pgn4web-3.06/images/svgchess");
    ```

* Upload / broadcast your PGN files on the server, and define their locations in `assets/js/config.js` in the `listPGNFiles()` function. Detailed explanation of all parameters is located through comments in the file itself. A configuration example follows:
    ```javascript
    function listPGNFiles() {
        // If broadcasting a tournament
        allPGNs.push({
            "pgn" : "pgn/r1.pgn",
            "id" : "round-1"
        });
        allPGNs.push({
            "pgn" : "pgn/r2.pgn",
            "id" : "round-2"
        });
        // ...
        allPGNs.push({
            "pgn" : "pgn/all.pgn",
            "id" : "all-rounds"
        });
    
        // And/or if you just want to display some PGN files (ended tournaments)
        allPGNs.push({
            "pgn" : "pgn/last_year.pgn",
            "id" : "last-year",
            "video-left" : "https://www.youtube.com/embed/<your-code>",
            "video-right" : "https://www.youtube.com/embed/<your-code>",
            "image-left" : "<image-url>",
            "image-right" : "<image-url>"
        });
        // ...
    }
    ```

* Define round names in each supported language. E.g. for English, add in `assets/translations/en.json`:
    ```json
    {
        "round-1"              : "Round 1",
        "round-2"              : "Round 2",
        "all-rounds"           : "Archive",
        "last-year"            : "Tournament (last year's edition)",
    }
    ```
* _(Optional)_ Display additional information about players:
  * flag of player's federation (displayed close to the player's name)
  * additional player information and results of previous rounds (displayed on hover or touch over player's name)
  
  It is possible to fetch this additional information from [chess-results.com][34] using the script `scripts/fetch-chess-results.py`. Make sure to pass a link to a page containing the list of players (like _Starting rank_ or _Alphabetical list_).  Examples (execute in `scripts` folder):
  * Use option `flag` to only fetch flags of player's federation. 
    ```bash
    python fetch-chess-results.py flag 'https://chess-results.com/tnr752588.aspx?lan=1'
    ```
  * Use option `full` to fetch both flags of player's federation and information about each player's opponents from previous rounds. 
    ```bash
    python fetch-chess-results.py full 'https://chess-results.com/tnr752588.aspx?lan=1'
    ```
    
  Both options will generate a file named `chess-results-players.json` from which the client will read informations about players. Do not move or rename this file.  
   
* _(Optional)_ Display player photos inside player tooltip:  
  * path to photos folder is defined in `assets/js/config.js`
    ```javascript
    let playerImagesPath = "scripts/players"
    ```
  * supported extensions are `.jpg` and `.png`
  * image filename for a player must be his FIDE ID
      * for example, photo of [Magnus Carlsen][39] can be named either `1503014.jpg` or `1503014.png`
  * manual import of images is possible; images must follow naming convention above
  * for automatic download of images from FIDE webpage, use script in `scripts/fetch-fide-images.py`. In order to do so, the file `chess-results-players.json` (containing FIDE IDs) from the previous step is a prerequisite. Example (execute in `scripts` folder):
    ```bash
      python fetch-fide-images.py
    ```
     This will store images in the folder `scripts/players`. You can move them in another folder (e.g. `assets/images`), but don't forget to update `playerImagesPath` in `config.js`.

    <img src="https://i.imgur.com/y9YrrTA.png" width="420">|
    :---:|
    Player information displayed on mouse hover over player's name|


### Customization
In `index.html` you can:
* edit the general information about the tournament (e.g. header and navbar)
* set tab title
  ```html
      <title>Clint</title>
  ```
* add custom content in sections `CustomItemLeft` and `CustomItemRight`
* edit Open Graph and Twitter tags

In `assets/js/config.js` you can:
* in `operatorSettings()` list navbar hyperlinks. Detailed explanation of all parameters is located through comments in the file itself. For instance:
    ```javascript
    navbarLinks.push({
        "id"   : "photo-gallery-link",
        "link" : "https://www.example.com",
        "fa-icon" : "fas fa-images"
    });
    ```
    Define hyperlink names in each supported language. E.g. for English, add in `assets/translations/en.json`:
    ```json
    {
        "photo-gallery-link"   : "Photo Gallery",
    }
    ```
* in `listStreams()` define a single video stream or multiple video streams (from same channel). Detailed explanation of all parameters is located through comments in the file itself. For instance:
   ```javascript
   const streams = [
       {
           "language"    : "gb",
           "name"        : "Official broadcast",
           "webpage"     : "https://www.youtube.com/@FIDE_chess",
           "stream-item" : "https://www.youtube.com/embed/2g3Htm8qZ5o"
       }
   ];
   ```
* set some default options (such as autoplay delay, move highlighting etc.)
* set expected round duration (used for automatically choosing the initial PGN file to be opened)
* set languages to be used (from a set of supported languages)
    ```javascript
    let supportedLanguages = [
      "en",  // English
      "es",  // Español (Spanish)
      "hi",  // हिन्दी (Hindi)
      "hr"   // Hrvatski (Croatian)
    ];
    ```
* number of miniboards for the multiple boards view
    ```javascript
    let numberMiniboards = 6;
    ```

In `assets/style.css` you can:
* configure all the colors used on the page; it comes with a predefined light and dark theme
    ```css
    /* Light theme example preset */
    :root {
        --bg-color: #fff;
        --bg-color-text: #111;
        --bg-color-text-light: #888;
        --bg-color-light: #eee;
        --bg-color-light-text: #111;
        --bg-color-hover: #27c;
        --bg-color-hover-text: #fff;
        --bg-color-active: #cde;
        --main-color-bg: #ddd;
        --main-color-text: #111;
        --main-color-light: #eee;
        --main-color-light-text: #111;
        --main-color-hover: #cccf;
        --main-color-hover-text: #111;
        --main-color-border: #bbb;
        --player-item-color: #ddd;
        --player-item-color-text: #111;
        --bg-active-clock: #659d25;
        --bg-active-clock-text: #fff;
    }
    ```
* choose figurines font for moves notation
    ```css
    #GameText, #EngineVariationDiv {
        font-family: "pgn4web ChessSansPiratf";
        /* font-family: "pgn4web ChessSansMerida"; */
        /* font-family: "pgn4web ChessSansUsual"; */
    }
    ```

## Notes
* The repository includes sample PGN files from the [42nd Chess Olympiad][4], which are present only for illustrational and testing purposes. PGN files include
  * r1.pgn - 40 games
  * r2.pgn - 144 games
  * r3.pgn - 596 games
  * all.pgn - 7426 games

### Credits and license
* This website is based on [pgn4web][2]
* The engine currently used is Stockfish compiled to JavaScript. The releases are obtained from [stockfish.js][3a] and [stockfish.wasm][3b]
* Icons present on the website are from [Font Awesome][5] and [flag-icons][35]
* The layout of components is inspired by [lichess][10]
* The above items remains subject to their original licenses (if any)
* Remaining clint code is Copyright (c) 2024 Patrick Nikić (see [LICENSE][7] file)
* You are free to use clint for your website. You should give it a proper attribution, so that interested viewers can find this repository and also benefit from it

I hereby sincerely thank all the people who helped make clint better by comments, suggestions and code contributions. Your feedback is much appreciated.  

### Deployments
* Tournament of peace [2023][36], [2022][28], [2021][29]
* [Elllobregat Open Chess][27] (2022, 2023)
* [Salamanca chess festival][38]
* [Bosnia and Herzegovina team championship][20]
* Croatia team championship [2023][21], [2022][23], [2021][24]
* [Spanish team championship of Honor 2023][25]
* [Mitropa Cup 2023][26]
* Bošnjaci Open [2023][31], [2022][32]
* Several pages on [chesscout.info][11], e.g. [games from chess tournaments in BiH][12], Sarajevo club championship [2021][14] and [2022][22], [BiH Junior championships 2021][15]
* [Croatia Grand Chess Tour 2021][16]
* Schach-ticker - [viewer for collection of tournaments][33]
* Croatian Individual Senior Championship [2023][37], [2022][30], [2020][13]
* Croatian Individual Junior Championships [2021][17], [2020][18], [2019][19] -- here you can see the evolution of Clint over time

### Future work:
* Embed functionality (for sharing on other website)
* Compact display of multiple tournaments (when there are too many PGN files, the dropdown menu is not a good option)
* Resizable board
* Multiple videos / images on each side
* Tournament table
* Analysis board
* Add landing page (with countdown to tournament start, description, overview - multiple boards)
* Placeholder for notifications (e.g. below header)
* Show which games have new moves
* Clock countdown enhancement (fix interaction with board rotation - up to 1 second delay)
* Clock countdown alternative in case "ReferenceTime" tag is not present in PGN. Store timestamps when each move is detected and use together with "%clk" comments with game moves.
* Custom responsive design for mobile phones in landscape mode
* More flexibile tiling algorithm for multiple boards view in case of bigger number of boards
* Upgrade Stockfish to NNUE version

### Contribute
If you want to support my work, consider a donation via [PayPal][8]. Thank you!

Code contributions and translation are welcome.

#### About the author
<table>
  <tr>
    <td><img src="https://i.imgur.com/1tcwahy.jpg" width="100"></td>  
    <td>Patrick is a software engineer,<br>
        chess player and arbiter from Croatia.<br>
        Feel free to reach me over <a href="mailto:rickpa007@hotmail.com">e-mail</a>.
    </td>
  </tr>
</table>

[1a]: https://i.imgur.com/D4pfS7V.png
[1b]: https://i.imgur.com/nWbX44L.png
[1c]: https://i.imgur.com/lP1WsqP.png
[2]: http://pgn4web.casaschi.net/
[3a]: https://github.com/lichess-org/stockfish.js
[3b]: https://github.com/lichess-org/stockfish.wasm
[4]: https://en.wikipedia.org/wiki/42nd_Chess_Olympiad
[5]: https://fontawesome.com/
[6]: http://hrvatski-sahovski-savez.hr/ftp/sucelje_patrick/
[7]: https://github.com/pnikic/clint/blob/master/LICENSE
[8]: https://www.paypal.com/paypalme/pnikic
[10]: https://lichess.org/
[11]: https://www.chessscout.info/
[12]: https://www.chessscout.info/ftp/premijer-liga-BiH/
[13]: https://hrvatski-sahovski-savez.hr/ftp/CroCh2020/
[14]: https://www.chessscout.info/live/prvenstvo-sk-sarajevo/
[15]: https://www.chessscout.info/live/21-kad-jun-prvenstvo-bih-2021/
[16]: https://live.cgct.eu/
[17]: https://hrvatski-sahovski-savez.hr/ftp/PHjuniori2021/
[18]: https://hrvatski-sahovski-savez.hr/ftp/PHjuniori2020/
[19]: https://hrvatski-sahovski-savez.hr/ftp/PHjuniori2019/
[20]: https://premijer-liga-bih-2023.chessscout.info/partije-uzivo.html
[21]: https://hrvatski-sahovski-savez.hr/ftp/1A-2023/
[22]: https://www.chessscout.info/live/Prvenstvo-SK-Sarajevo-2022/
[23]: https://hrvatski-sahovski-savez.hr/ftp/1lige2022/
[24]: https://hrvatski-sahovski-savez.hr/ftp/PH-Prva-A-liga-2021/
[25]: https://sichess.com/feda/ceclub_dh2023/ronda_1.html
[26]: https://hrvatski-sahovski-savez.hr/ftp/mitropacup2023/
[27]: https://www.elllobregat.com/chess/
[28]: https://hrvatski-sahovski-savez.hr/ftp/turnir-mira2022/
[29]: https://hrvatski-sahovski-savez.hr/ftp/turnir-mira2021/
[30]: http://www.sah-mladost.com/CLINT/PPHseniori2022/
[31]: https://hrvatski-sahovski-savez.hr/ftp/bosnjaci2023/
[32]: https://hrvatski-sahovski-savez.hr/ftp/bosnjaci2022/
[33]: https://www.chess-international.com/clint/
[34]: https://chess-results.com/
[35]: https://github.com/lipis/flag-icons
[36]: https://hrvatski-sahovski-savez.hr/ftp/turnir-mira2023/
[37]: https://hrvatski-sahovski-savez.hr/ftp/pph2023/
[38]: https://festival.mainchess.com/
[39]: https://ratings.fide.com/profile/1503014
