module.exports = {
  "*.md,!test/**/*.md": [
    filenames => filenames.map(filename => `remark ${filename} -fo`)
  ],
  '*.ts': 'xo --fix',
  'package.json': 'fixpack'
};
