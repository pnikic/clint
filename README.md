# clint - chess live interface
clint is a complete website for live broadcasting of a chess tournament based on [pgn4web][2]. It is inspired by many chess websites and strives to offer their best functionalities to any chess broadcast operator.

Single board view | Multiple boards view
:---:|:---:
![interface screenshot][1a] | ![interface screenshot][1b]

A demo is available on: http://hrvatski-sahovski-savez.hr/ftp/sucelje_patrick/

### Features
* Banner with general information about the tournament and customizable buttons for hyperlinks (other websites, photo gallery, tournament regulations etc.) 
* Chess board with compactly displayed player names, clock times and ratings
* PGN section for display and navigation
* Engine analysis
* Switching between different games and rounds on the same page
* Download PGN / FEN of the current game, round or whole tournament
* Multiple boards view (e.g. 6 boards)
* Mobile phone friendly

## Usage
### Setup
* Clone the repository on your web server
* Download [pgn4web][2] on your web server
* Edit the `pgn4web.js` path and the fonts path in `index.html` and in `mosaic-tile.html`  
(in my case, pgn4web-3.04 is placed one directory up)
```html
<script src="../pgn4web-3.04/pgn4web.js"></script>
...
<link rel="stylesheet" type="text/css" href="../pgn4web-3.04/fonts/pgn4web-font-ChessSansUsual.css">
```
and the image path for the pieces in `assets/js/setup.js`
```javascript
SetImagePath("../pgn4web-3.04/images");
```

* Upload / broadcast your PGN files on the server, and define their locations in `assets/js/setup.js` in the `operatorSettings()` function. For instance:
```javascript
function operatorSettings() {
    allPGNs.push(["Round 1 - dd/mm/yyyy hh:mm", "pgn/r1.pgn"])
    //...
}
```
### Customization
In `index.html` you can:
* edit the general information about the tournament
* add / edit buttons for hyperlinks

In `assets/js/setup.js` you can configure:
* in `operatorSettings()` edit the links to already defined buttons and name of the operator
* some default options (such as autoplay delay, move highlighting etc.)
* number of miniboards with the height and width (in pixels) of the <iframe> in which the miniboard will be embedded
```javascript
let numberMiniboards = 6;
let miniboardWidth = 330;
let miniboardHeight = 410;
```

In `assets/js/mosaic-setup.js` you can configure the size (in pixels) of a miniboard. For example:
```javascript
adjustBoardSize(300);
```

In `assets/style.css` you can do some basic configuration of used colors. The customization of colors will be systematically addressed later
```css
:root {
    --bg-color: #F3F3F3;
    --first-color: #DCDCDC;
}
```


## Notes
* The page is currently in Croatian. With little effort, it can be translated to any language
* The repository includes sample PGN files from the [42nd Chess Olympiad][4], which are present only for illustrational purposes. Each PGN file includes cca. 600 games

## Credits and license
* This website is based on [pgn4web][2]
* The engine currently used is Stockfish compiled to JavaScript. The release is obtained from [stockfish.js][3]
* Icons present on the website are from [Flaticon][5] (made by [PixelPerfect][8] and [Freepik][9]), or from [Wikimedia][6]
* The above items remains subject to their original licenses (if any)
* Remaining clint code is Copyright (c) 2020 Patrick Nikić (see [LICENSE][7] file)
* You are free to use clint for your website. You are encouraged to notify me if you are using clint

## Future work:
* Translation
* Add functionality for live time countdown during broadcast
* Add snackbar-like notifications when a moves is played
* Monitor number of visitors
* Implement resizable board
* Fix some responsive design issues (regarding to mobile phone rotations)
* Customization of colors

[1a]: https://i.imgur.com/ZmfilnT.png
[1b]: https://i.imgur.com/rYu38s4.png
[2]: http://pgn4web.casaschi.net/
[3]: https://github.com/niklasf/stockfish.js
[4]: https://en.wikipedia.org/wiki/42nd_Chess_Olympiad
[5]: https://www.flaticon.com/
[6]: https://www.wikimedia.org/
[7]: https://github.com/pnikic/clint/blob/master/LICENSE
[8]: https://www.flaticon.com/authors/pixel-perfect
[9]: https://www.flaticon.com/authors/freepik
