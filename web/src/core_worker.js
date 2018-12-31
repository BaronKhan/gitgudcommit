const startTime = new Date().getTime();
var started = false;
importScripts("gitgudcore.js");

Module['onRuntimeInitialized'] = () => {
  console.log('gitgudcore ready in webworker.',(new Date().getTime() - startTime),'ms startup time');
  Module.jsInitPosTagger();
  started = true;
};

self.addEventListener('message', function(e) {
  if (!started) { return; }
  var data = e.data;
  switch (data.cmd) {
    case "analyse":
      var commit = data.commit;
      var analysedCommit = new Module.Commit(commit.author, commit.email, commit.message, parseInt(commit.time));
      self.postMessage({ 'type': 'score', 'data': analysedCommit.getCommitScore() })
      var suggestions = [];
      var suggestions_raw = analysedCommit.getSuggestionsMessages();
      for (var i = 0; i < suggestions_raw.size(); i++) {
          suggestions.push(suggestions_raw.get(i));
      }
      self.postMessage({ 'type': 'suggestions', 'data': suggestions })
      var line_numbers = [];
      var line_numbers_raw = analysedCommit.getSuggestionsLines();
      for (var i = 0; i < line_numbers_raw.size(); i++) {
          line_numbers.push(line_numbers_raw.get(i));
      }
      self.postMessage({ 'type': 'line_numbers', 'data': line_numbers })
      break;
    default:
      console.log('Unknown command: ' + data.cmd);
  }
}, false);