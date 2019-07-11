const startTime = new Date().getTime();
var started = false;
var files = [];
importScripts("gitgudcore.js");

Module['onRuntimeInitialized'] = () => {
  console.log('gitgudcore ready in webworker.',(new Date().getTime() - startTime),'ms startup time');
  Module.jsInitPosTagger();
  Module.jsInitSpellChecker();
  started = true;
  self.postMessage("___READY___")
};

self.addEventListener('message', function(e) {
  if (!started) { return; }
  var data = e.data;
  switch (data.cmd) {
    case "reset":
      Module.jsResetFilenames();
      break;
    case "files":
      files = data.files;
      for (var i=0; i<files.length; i++) {
        Module.jsAddFilename(files[i]);
      }
      break;
    case "analyse":
      var commit = data.commit;
      var analysedCommit = new Module.Commit(commit.author, commit.email, commit.message, parseInt(commit.time));
      self.postMessage({ 'type': 'score', 'data': analysedCommit.getCommitScore() })
      var suggestions = [];
      var suggestions_raw = analysedCommit.getSuggestions();
      for (var i = 0; i < suggestions_raw.size(); i++) {
          suggestions.push(suggestions_raw.get(i));
      }
      self.postMessage({ 'type': 'suggestions', 'data': suggestions })
      break;
    default:
      console.log('Unknown command: ' + data.cmd);
  }
}, false);