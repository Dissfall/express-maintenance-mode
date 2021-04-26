module.exports = {
  "*.md,!test/**/*.md": [
    filenames => filenames.map(filename => `remark ${filename} -fo`)
  ],
  'package.json': 'fixpack',
  '*.ts': 'xo --fix'
};
