var REVIEW = require('./review');

var fs = require('fs');
var input = fs.readFileSync('/dev/stdin').toString();
var comments = REVIEW.reviewFile(input);
console.log(comments);
