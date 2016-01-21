var config = require('./config');
var gerrit = require('./gerrit');
var review = require('./review');

gerrit.listChanges('is:watched is:open')
.then(function(changes){
  var minDate = new Date();
  minDate.setDate(minDate.getDate() - config.RECENT_DAYS);

  changes = changes.filter(function(change){
    if (new Date(change.updated) < minDate) {
      console.log('too-old', change.id);
      return false;
    }
    var revisionNumber = change.revisions[change.current_revision]._number;
    return !change.messages.some(function(msg){
      return msg._revision_number == revisionNumber && config.COVER_REGEX.test(msg.message);
    });
  });

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
