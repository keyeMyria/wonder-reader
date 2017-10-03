// clean.js clears out old cache files. Might be worth doing at app.close

const fs = require('fs');
const getSize = require('get-folder-size');
const os = require('os');
const path = require('path');
const sander = require('sander');

const cacheDirectory = path.join(os.tmpdir(), 'wonderReader', 'cache');

// Function variable
let clearCache;

// Cleans out the crap
exports.trash = (currentDirectory) => {
  getSize(cacheDirectory, function(err, size) {
    if (err)
      console.error(err);
    let cacheSize = size / 1024 / 1024;
    let r = confirm(`This will clear your Wonder Reader cache (Currently ${cacheSize.toFixed(2)} Mb). \n\nContinue?`);
    if (r === true)
      clearCache(currentDirectory);
  });
};

// For when I ever plan to introduce an autoCleaning feature
exports.autoTrash = () => {
  clearCache(cacheDirectory);
};

// The crap cleaner function itself
clearCache = (currentDirectory) => {
  let cacheContents = fs.readdirSync(cacheDirectory);
  for (let i = 0; i < cacheContents.length; i++) {
    let item = path.join(cacheDirectory, cacheContents[i]);
    if (cacheContents[i] !== currentDirectory && fs.statSync(item).isDirectory())
      sander.rimrafSync(item); // Deletes older directories for cached comics
  }
};
