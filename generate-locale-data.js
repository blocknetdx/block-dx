const path = require('path');
const fs = require('fs-extra-promise');
const matchAll = require('string.prototype.matchall');

const baseDir = path.join(__dirname, 'src');

const selectedFiles = [];

const processFile = async function(filePath) {
  const stats = await fs.statAsync(filePath);
  if(stats.isDirectory()) {
    const files = await fs.readdirAsync(filePath);
    for(const file of files) {
      await processFile(path.join(filePath, file));
    }
  } else if(['.js', '.ts', '.html'].includes(path.extname(filePath).toLowerCase())) {
    selectedFiles.push(filePath);
  }
};

const functionPatt = /Localize\.text\('(.+?)',\s*?'(.+?)'/g;
const componentPatt0 = /<Localize\s+context="(.+?)"\s+key=["'](.+?)["']>/g;
const componentPatt1 = /<Localize\s+key=["'](.+?)["']\s+context="(.+?)">/g;

(async function() {
  try {
    const locale = 'en';
    const matches = [];
    await processFile(baseDir);
    for(const file of selectedFiles) {
      let contents = await fs.readFileAsync(file, 'utf8');
      contents = contents.replace(/\\'/g, `'`);
      [...matchAll(contents, functionPatt)]
        .filter(arr => arr.length > 1)
        .reduce((arr, a) => {
          return [...arr, a.slice(1, 3)];
        }, [])
        .forEach(([ key, context ]) => matches.push({ key, context }));
      [...matchAll(contents, componentPatt0)]
        .filter(arr => arr.length > 1)
        .reduce((arr, a) => {
          return [...arr, a.slice(1, 3)];
        }, [])
        .forEach(([ context, key ]) => matches.push({ key: key.replace(/\\/g, ''), context}));
      [...matchAll(contents, componentPatt1)]
        .filter(arr => arr.length > 1)
        .reduce((arr, a) => {
          return [...arr, a.slice(1, 3)];
        }, [])
        .forEach(([ key, context ]) => matches.push({ key: key.replace(/\\/g, ''), context}));
    }
    const localeData = {
      locale
    };
    for(const { key, context } of matches) {
      if(localeData[key]) {
        localeData[key] = {
          ...localeData[key],
          [context]: {
            val: key,
            note: ''
          }
        };
      } else {
        localeData[key] = {
          [context]: {
            val: key,
            note: ''
          }
        };
      }
    }
    const json = JSON.stringify(localeData, null, '  ');
    console.log(json);
    const localesDir = path.join(__dirname, 'locales');
    await fs.ensureDirAsync(localesDir);
    await fs.writeFileAsync(path.join(localesDir, locale + '.json'), json);
  } catch(err) {
    console.error(err);
  }
})();
