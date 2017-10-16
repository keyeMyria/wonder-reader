// directory.js merges directories within directories to then return a new path
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

// Allowable File Types
const imgTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
// Returns a path of the extracted comic up until the first image file appears

// Checks for valid image types
const validExtName = (file) => {
  return imgTypes.indexOf(path.extname(file).toLowerCase()) > -1;
};

const validPath = (directory, file) => {
  return fs.statSync(path.join(directory, file)).isDirectory();
};

const filter = (directory) => {
  dirCleaner(directory);
  return fs.readdirSync(directory).filter(function(file) {
    return validExtName(file) || validPath(directory, file);
  });
};

const dirCleaner = (directory) => {
  let files = fs.readdirSync(directory);
  for (let i = 0; i < files.length; i++) {
    let newPath = path.join(directory, files[i]);
    if (fs.statSync(newPath).isDirectory()) {
      fs.readdirSync(newPath) == 0
        ? rimraf.sync(newPath)
        : dirCleaner(newPath);
    }
  }
};

exports.merge = (directory) => {
  let extractedFiles = filter(directory),
    filtered;

  if (extractedFiles.length > 0) {
    while (validPath(directory, extractedFiles[0])) {
      filtered = '';

      // Pushes [i] to array for merging paths
      if (validExtName(extractedFiles[0]) || validPath(directory, extractedFiles[0]))
        filtered = extractedFiles[0];

      directory = path.join(directory, filtered);

      // removes unwanted metadata and other stuff
      extractedFiles = filter(directory);
    }
  }
  return directory;
};

// Splits a path, encodes each index, and merges it all for a URI compatible file path.
exports.encode = (oldPath) => {
  let c,
    newPath = '',
    tempPath = oldPath.split(path.sep); // Breaks path into array
  // Encodes each folder, then merging it all together
  switch (process.platform) {
    case 'win32':
      c = tempPath[0]; // Saves letter drive information
      for (let j = 1; j < tempPath.length; j++) {
        newPath = path.join(newPath, encodeURIComponent(tempPath[j]));
      }
      newPath = path.join(c, newPath); //returns c:\path\to\file.cbz
      return newPath;
    default:
      for (let j = 0; j < tempPath.length; j++) {
        newPath = path.join(newPath, encodeURIComponent(tempPath[j]));
      }
      newPath = `/${newPath}`; // To set root folder
      newPath = newPath.replace(/'/g, '\\\''); // Fixes err with the character \'
      return newPath;
  }
};
