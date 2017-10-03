// library.js : to populate the library with an interactive list of available selections

const $ = require('jquery');
const bookmark = require('./bookmark.js');
const config = require('./config.js');
const {dialog} = require('electron').remote;
const df = require('./directory.js');
const fs = require('fs');
const isComic = require('./isComic.js');
const path = require('path');
const sander = require('sander');

const libStatus = document.getElementById('libStatus');
const sideLib = document.getElementById('sideLib');

const libError = 'Library not found. Click <span class="code"><i class="fa fa-search"></i></span> to load a directory.';
const loading = 'Your library is loading';
const finished = '';

// Function variables
let build,
  toggle,
  buildLibrary,
  slide,
  folders;

// Library Windows collapsing
slide = () => {
  sideLib.classList.toggle('shift-left');
};

toggle = () => {
  $('#mainLib').slideToggle(800);
};

// Builds the library with proper HTML
buildLibrary = (directory, listID) => {
  if (!sander.existsSync(directory)) {
    console.error(`${directory} not found.`);
    libStatus.innerHTML = libError;
    return;
  }
  let files = fs.readdirSync(directory);
  libStatus.innerHTML = loading;

  // `For` loop to create elements for the DOM
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let filePath = path.join(directory, file);
    let stat = fs.statSync(filePath);
    // Inserts file.loader() for files
    if (stat.isFile() && isComic(file)) {
      file = path.basename(file, path.extname(file));
      filePath = df.encode(filePath);
      // Converts win32 paths to HTML compatible paths
      if (process.platform == 'win32') {
        filePath = filePath.replace(/\\/g, '/');
        console.log(filePath);
      }
      $(`#${listID}`).append(`<li class="file">
          <a href="#" onclick="file.loader('${filePath}')">
            <i class="fa fa-file" aria-hidden="true"></i>
            ${file} ${bookmark.percent(file)}
          </a>
        </li>`);

      // Deep scans interior folders
    } else if (stat.isDirectory() && file.charAt(0) != '.') {
      // Removes potentially damaging characters for app
      let newListID = (`${listID}${file}`).replace(/\s|#|\(|\)|'|,|&|\+|-|!|\[|\]|\./g, '');
      $(`#${listID}`).append(`<li class="folder" data-id='${newListID}' data-directory="${filePath}">
          <span>
            <i class="fa fa-folder" aria-hidden="true"></i>
            <i class="fa fa-caret-down rotate" aria-hidden="true"></i>
            ${file}
          </span>
          <ul id=${newListID}></ul>
        </li>`);
    }
  }

  libStatus.innerHTML = finished;
  folders(directory, listID);
};

exports.slide = () => {
  slide();
};

exports.toggle = () => {
  toggle();
};

// Dialog to open up directory
exports.openDir = () => {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function(fileNames) {
    if (fileNames === undefined)
      return;
    build(fileNames[0]);
  });
};

// Exported version of buildLibrary()
exports.builder = (filePath) => {
  build(filePath);
};

build = (filePath) => {
  config.libSave(filePath);
  config.databaseBuild(filePath);
  $('#ulLib li, #ulLib ul').remove();
  buildLibrary(filePath, 'ulLib');
};

folders = (directory, ID) => { // Toggle for folders in MainLib
  let folders = document.querySelectorAll(`#${ID} .folder`);
  for (let i = 0; i < folders.length; i++) {
    let newID = folders[i].dataset.id;
    let newDirectory = folders[i].dataset.directory;
    folders[i].querySelector('span').addEventListener('click', () => {
      if ($(`#${newID}`).children().length == 0)
        buildLibrary(newDirectory, newID);
      let _ul = $(this).next('ul');
      if (_ul.is(':animated'))
        return;
      $(this).children('.fa-caret-down').toggleClass('rotate');
      _ul.slideToggle(300, 'linear');
    });
  }
};
