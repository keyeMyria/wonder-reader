// bookmark.js updates read percentage as well as saving the position in $temp/bookmark.json

const isThere = require('is-there');
const jsonfile = require('jsonfile');
const os = require('os');
const path = require('path');

let template = {}, // {"name": "", "currentIndex": "0", "fullIndex": "0"}
  baseName,
  obj;
const bookmark = path.join(os.tmpdir(), 'wonderReader', 'json', 'bookmark.json');
const regex = /\s|#|\(|\)|'|,|&|\+|!|\[|\]/gi; // Reg Ex for classes

// Invoked on Comic.onLoad(), returns with current page and option to continue
exports.onLoad = (filePath, directoryContents) => {
  baseName = path.basename(filePath);
  console.log(`${baseName} loaded into Wonder Reader!`);

  template = {
    name: baseName,
    currentIndex: 0,
    fullIndex: directoryContents.length - 1
  };

  if (isThere(bookmark)) {
    obj = jsonfile.readFileSync(bookmark);
    if (obj[baseName]) { // if baseName is listed
      return obj[baseName].currentIndex;
    } else { // if baseName isn't listed, adds item to bookmark.json
      obj[baseName] = template;
      jsonfile.writeFileSync(bookmark, obj, {spaces: 2});
      return 0;
    }
  } else {
    obj = {};
    obj[baseName] = template; // Pushes into Array
    jsonfile.writeFileSync(bookmark, obj, {spaces: 2});
    return 0;
  }
};

// Updates JSON with current page
exports.onChange = (index) => {
  jsonfile.readFile(bookmark, function(err, obj) {
    if (err)
      return console.error(err);
    obj[baseName].currentIndex = index;
    jsonfile.writeFile(bookmark, obj, function(err) {
      if (err)
        return console.error(err);
    });
    let comic = obj[baseName];
    let base = path.basename(comic.name, path.extname(comic.name));
    let spanClass = base.replace(regex, '');
    let percent = (comic.currentIndex / comic.fullIndex) * 100;
    let elem = document.getElementsByClassName(spanClass);
    for (let i = 0; i < elem.length; i++) {
      elem[i].innerHTML = `${percent.toFixed(0)}%`;
    }
  });
};

exports.onStart = () => {
  obj = isThere(bookmark)
    ? jsonfile.readFileSync(bookmark)
    : {};
};

// Fills library with percentage read on right hand side
exports.percent = (fileName) => {
  let base = path.basename(fileName, path.extname(fileName));
  let spanClass = base.replace(regex, '');
  let percent;
  if (isThere(bookmark)) {
    percent = obj[fileName]
      ? (obj[fileName].currentIndex / obj[fileName].fullIndex) * 100
      : 0;
  } else {
    jsonfile.writeFileSync(bookmark, obj, {spaces: 2});
    percent = 0;
  }
  return `<span class="bmPercent ${spanClass}">${percent.toFixed(0)}%</span>`;
};
