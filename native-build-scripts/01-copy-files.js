const co = require('co');
const fs = require('fs-extra-promise');
const path = require('path');
const rmrf = require('rmrf-promise');
const omit = require('lodash/omit');

co(function*() {
  try {

    const buildDir = 'dist-native';
    const tempDir = 'temp';

    yield rmrf(buildDir);
    yield rmrf(tempDir);

    yield fs.ensureDirAsync(tempDir);
    yield fs.ensureDirAsync(buildDir);

    const filesToCopy = [
      'dist',
      'index.js',
      'tos.txt',
      'src-back'
    ];

    for(const file of filesToCopy) {
      yield fs.copyAsync(file, path.join(tempDir, file));
    }

    const packageJSON = yield fs.readJsonAsync('package.json');

    const newPackageJSON = omit(packageJSON, ['build', 'devDependencies']);

    yield fs.writeJsonAsync(path.join(tempDir, 'package.json'), newPackageJSON);

  } catch(err) {
    console.error(err);
  }
});
