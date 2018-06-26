const fs = require('fs');
const path = require('path');
const sass = require('node-sass');

const { css } = sass.renderSync({
  file: path.join('sweetalert-scss', 'sweetalert2.scss')
});

fs.writeFileSync(path.join('src', 'assets', 'vendor', 'css', 'sweetalert2.css'), css);
