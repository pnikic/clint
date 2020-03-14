# clint - chess live interface
clint is a complete website for live broadcasting of a chess tournament based on [pgn4web][2]. It is inspired by many chess websites and strives to offer their best functionalities to any chess broadcast operator.

![interface screenshot][1]
A demo is available on: http://hrvatski-sahovski-savez.hr/ftp/sucelje_patrick/

### Features
* Banner with general information about the tournament and customizable buttons for hyperlinks (other websites, photo gallery, tournament regulations etc.) 
* Chess board with compactly displayed player names, clock times and ratings
* PGN section for display and navigation
* Engine analysis
* Switching between different games and rounds on the same page
* Download PGN / FEN of the current game, round or whole tournament
* Mobile phone friendly

### Usage
* Clone the repository on your web server
* Download [pgn4web][2] on your web server
* Edit the `pgn4web.js` path in `index.html` (in my case, pgn4web-3.03 is placed one directory up)
```html
<script src="../pgn4web-3.03/pgn4web.js"></script>
```
and the image path for the pieces in `assets/js/setup.js`
```javascript
SetImagePath("../pgn4web-3.03/images");
```

* Upload / broadcast your PGN files on the server, and define their locations in `assets/js/setup.js` in the `operaterSettings()` function. For instance:
```javascript
function operaterSettings() {
    allPGNs.push(["Round 1 - dd/mm/yyyy hh:mm", "pgn/r1.pgn"])
    //...
}
```
You can also do further customization in the same function. To edit the general informations and add / edit buttons for hyperlinks, go directly in the `index.html` file.

### Notes
* The page is currently in Croatian. With little effort, it can be translated to any language
* The repository includes sample PGN files from the [42nd Chess Olympiad][4], which are present only for illustrational purposes

### Credits and license
* This website is based on [pgn4web][2]
* The engine currently used is Stockfish compiled to JavaScript. The release is obtained from [stockfish.js][3]
* Icons present on the website are from the [Noun Project][5] and [Wikimedia][6]
* The above items remains subject to their original licenses (if any).
* Remaining clint code is Copyright (c) 2020 Patrick Nikić (see [LICENSE][7] file)
* You are free to use clint for your website. You are encouraged to notify me if you are using clint.

### Future work:
* Translation
* Add functionality for live time countdown during broadcast
* Rework game selection menu with better names formatting
* Add snackbar-like notifications when a moves is played
* Monitor number of visitors
* Implement resizable board
* Implement multiple boards view (e.g. 6 boards)
* Fix some responsive design issues (regarding to mobile phone rotations)

[1]: https://i.imgur.com/10SCn7c.png
[2]: http://pgn4web.casaschi.net/
[3]: https://github.com/niklasf/stockfish.js
[4]: https://en.wikipedia.org/wiki/42nd_Chess_Olympiad
[5]: https://thenounproject.com/
[6]: https://www.wikimedia.org/
[7]: https://github.com/pnikic/clint/blob/master/LICENSE
