const gitworker = new Worker("git_worker.js");

var currentCommit = {};

gitworker.addEventListener('message', function(e) {
  if (typeof e.data === 'object' && e.data.hasOwnProperty('author')) {
    currentCommit = e.data;
  }
  console.log(e.data);
}, false);

function cloneTest() {
  clone('https://github.com/BaronKhan/chip8Emulator.git', 'chip8Emulator')
}

function clone(url, dir_name) {
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
}

function getNextCommit() {
  gitworker.postMessage({'cmd': 'walknextcommit'});
}

function endWalk() {
  gitworker.postMessage({'cmd': 'endwalk'});
}