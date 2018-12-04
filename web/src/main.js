const gitworker = new Worker("git_worker.js");

var currentCommit = {};
var commits = [];

var getCommits = false;
var analysisInProgress = false;
var finishedWalk = false;

var cloneProgress = 0;
var analysisProgress = 0;

gitworker.addEventListener('message', function(e) {
  if (typeof e.data === 'object') {
    if (e.data.hasOwnProperty('author')) {
      currentCommit = e.data;
      commits.push(currentCommit);
      if (analysisInProgress && !finishedWalk) {
        setProgressBar();
        analysisProgress = Math.min(analysisProgress+1, 50);
        getNextCommit();
      }
    } else if (e.data.hasOwnProperty('cloneprogress')) {
      cloneProgress = e.data.cloneprogress;
      setProgressBar();
      if (parseInt(cloneProgress) >= 100 && getCommits) {
        walkCommits();
        getCommits = false;
      }
      return; //Don't log the progress percentage
    }
  } else if (e.data == "___NULL___") {
    if (analysisInProgress) {
      finishedWalk = true;
      endWalk();
      analysisProgress = 50;
      console.log("Retrieved all commits");
      analyseCommits();
    }
  }
  console.log(e.data);
}, false);

function cloneTest() {
  clone('https://github.com/BaronKhan/chip8Emulator', 'chip8Emulator')
}

function analyseRepo(url) {
  analysisInProgress = true;
  getCommits = true;
  cloneProgress = 0;
  analysisProgress = 0;
  var dir_name = "";
  var regexp = /(https:\/\/|git@)github.com\/([a-zA-Z0-9\-\_\/]+|)/g;
  var match = regexp.exec(url);
  if (match && match.length > 2) {
    dir_name = match[2];
    clone(url, dir_name);
  } else {
    console.log("Error: invalid URL");
    return false;
  }
}

function walkCommits() {
  finishedWalk = false;
  analysisProgress = 0;
  console.log("Retrieving commits");
  startWalk();
  getNextCommit();
}

function analyseCommits() {
  console.log("Analysing commits...");
  if (commits.length < 1)
    return true;
  var numCommits = commits.length;
  console.log("Total commits: "+numCommits);
  for (i=0; i<numCommits; i++) {
    analysisProgress = 50 + Math.ceil(((i+1)*50.0)/numCommits);
    setProgressBar();
  }
  analysisInProgress = false;
}

function clone(url, dir_name) {
  cloneProgress = 0;
  setProgressBar();
  if (url.startsWith("git@")) {
    url = url.replace("git@", "https://");
  }
  if (!url.endsWith(".git")) {
    url += ".git";
  }
  gitworker.postMessage({
    'cmd': 'clone', 
    'location': url,
    'dir_name': dir_name});
  return true;
}

function chdir(dir_name) {
  gitworker.postMessage({
    'cmd': 'chdir',
    'dir_name': dir_name
  });
}

function startWalk() {
  gitworker.postMessage({'cmd': 'startwalk'});
  commits = [];
  finishedWalk = false;
}

function getNextCommit() {
  gitworker.postMessage({'cmd': 'walknextcommit'});
}

function endWalk() {
  gitworker.postMessage({'cmd': 'endwalk'});
}

function setProgressBar() {
  var elem = document.getElementById("cloneProgressBar");   
  elem.style.width = ((cloneProgress * 0.8) + (analysisProgress * 0.2)) + '%';
}

function getProgressBar() {
  var elem = document.getElementById("cloneProgressBar");   
  return elem.style.width;
}