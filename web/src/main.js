const gitworker = new Worker("git_worker.js");

var currentCommit = {};
var commits = [];
var finishedWalk = false;
var cloneProgress = 0;

gitworker.addEventListener('message', function(e) {
  if (typeof e.data === 'object') {
    if (e.data.hasOwnProperty('author')) {
      currentCommit = e.data;
      commits.push(currentCommit);
    } else if (e.data.hasOwnProperty('cloneprogress')) {
      cloneProgress = e.data.cloneprogress;
      setProgressBar();
      return; //Don't log the progress percentage
    }
  } else if (e.data == "___NULL___") {
    finishedWalk = true;
  }
  console.log(e.data);
}, false);

function cloneTest() {
  clone('https://github.com/BaronKhan/chip8Emulator', 'chip8Emulator')
}

function clone(url, dir_name) {
  cloneProgress = 0;
  setProgressBar();
  if (!url.endsWith(".git")) {
    url += ".git"
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
  elem.style.width = cloneProgress + '%';
}