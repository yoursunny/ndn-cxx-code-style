var dateFormat = require('date-format');
var config = require('./config');
var gerrit = require('./gerrit');
var review = require('./review');

var minDate = new Date();
minDate.setDate(minDate.getDate() - config.RECENT_DAYS);
var after = dateFormat.asString('yyyy-MM-dd hh:mm:ss O', minDate);
var query = 'is:watched is:open label:Code-Style=0 after:"' + after + '"';
if (process.argv[2]) {
  query = 'change:' + process.argv[2];
}

gerrit.listChanges(query)
.then(function(changes){
  return Promise.all(changes.map(function(change){
    console.log('fetch', change.id);
    return gerrit.fetchFiles(change)
      .then(function(files){
        var fileComments = {};
        files.forEach(function(file){
          fileComments[file.filename] = review.reviewFile(file.contents, file.filename, change.project);
        });
        console.log('post', change.id);
        return gerrit.postComments(change, fileComments);
      })
      .then(function(){ console.log('done', change.id); })
  }));
})
.catch(console.warn);
