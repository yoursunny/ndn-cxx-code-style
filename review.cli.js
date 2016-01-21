var review = require('./review');

var fs = require('fs');
var input = fs.readFileSync('/dev/stdin').toString();
var comments = review.reviewFile(input, '-', '-');
console.log(comments);
