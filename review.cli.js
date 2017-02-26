// nodejs review.cli.js <file-type> <repository> < file

var review = require('./review');

var fs = require('fs');
var input = fs.readFileSync('/dev/stdin').toString();
var comments = review.reviewFile(input, process.argv[2] || 'cpp', process.argv[3] || '-');
console.log(comments);
