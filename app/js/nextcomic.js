// Loads Functions onto previous and next buttons

const file = require('./file.js');
const fs = require('fs');
const isComic = require('./isComic.js');
const path = require('path');

// Function variable
let enable = (id) => { document.getElementById(id).disabled = false; };
let disable = (id) => { document.getElementById(id).disabled = true; };

const nextComic = document.getElementById('nextComic');
const prevComic = document.getElementById('prevComic');

// Configures Next/Prev comic buttons
exports.load = (fileName) => {
  let nextSrc, prevSrc;
  disable('nextComic');
  disable('prevComic');

  let baseName = path.basename(fileName),
    dirName = path.dirname(fileName),
    comicSeries = fs.readdirSync(dirName);

  // Cleans out folders and non ['cbr', 'cbz'] files
  let comics = comicSeries.filter(function (x, i) {
    let comic = path.join(dirName, comicSeries[i]);
    return fs.statSync(comic).isFile() && isComic(comic);
  });

  // Gets index position of file inside directory array
  let currentIssue = comics.indexOf(baseName); // Like a comic book issue!

  if (comics.length > 1) {
    if (currentIssue <= 0) { // If loaded comic is first comic in directory
      nextSrc = path.join(dirName, comics[currentIssue + 1]);
      nextComic.onclick = function () { file.loader(nextSrc); };
      enable('nextComic');
    } else if (currentIssue >= comics.length - 1) { // If loaded comic is the last comic in directory
      prevSrc = path.join(dirName, comics[currentIssue - 1]);
      prevComic.onclick = function () { file.loader(prevSrc); };
      enable('prevComic');
    } else { // If comic is somewhere in the middle of the directory array
      nextSrc = path.join(dirName, comics[currentIssue + 1]);
      prevSrc = path.join(dirName, comics[currentIssue - 1]);
      nextComic.onclick = function () { file.loader(nextSrc); };
      prevComic.onclick = function () { file.loader(prevSrc); };
      enable('nextComic');
      enable('prevComic');
    }
  }
};
