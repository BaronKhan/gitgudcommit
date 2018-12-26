const gitworker = new Worker("git_worker.js");

var currentCommit = {};
var commits = [];

var getCommits = false;
var analysisInProgress = false;
var finishedWalk = false;

var cloneProgress = 0;
var analysisProgress = 0;

var fileCount = 0;
var repoName = "";

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
    } else if (e.data.hasOwnProperty('files_processed')) {
      // console.log("fileCount = "+fileCount+"; files_processed = "+e.data.files_processed)
      if (fileCount > 0) {
        cloneProgress = Math.floor(e.data.files_processed*100)/fileCount;
        setProgressBar();
      }
      if (e.data.files_processed == fileCount) {
        console.log("All files processed");
        gitworker.postMessage({
          'cmd': 'open',
          'repo_name': repoName
        })
      }
    }
  } else if (e.data == "___NULL___") {
    if (analysisInProgress) {
      finishedWalk = true;
      endWalk();
      analysisProgress = 50;
      console.log("Retrieved all commits");
      analyseCommits();
    }
  } else if (e.data == "___OPENED___" && getCommits) {
    walkCommits();
    getCommits = false;
  }
  console.log(e.data);
}, false);

function cloneTest() {
  analyseRepo('https://github.com/BaronKhan/chip8Emulator');
}

function analyseRepo(url) {
  if (analysisInProgress)
    return false;
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

////////////////////////////////////////////////////////////////////

uploadZip.onchange = function() {
  if (analysisInProgress)
    return;
  analysisInProgress = true;
  getCommits = true;
  cloneProgress = 0;
  analysisProgress = 0;
  gitworker.postMessage({'cmd': 'resetcount'})
  var zip = new JSZip();
  fileCount = 0;
  zip.loadAsync(this.files[0]).then(function(contents) {
    // process ZIP file content here
    try {
      var isRepo = false;
      Object.keys(contents.files).forEach(function(filename) {
        var pattern = ".git/";
        if (filename.includes(pattern)) {
          if (!isRepo) {
            repoName = filename.substr(0, filename.indexOf(pattern));
            isRepo = true;
          }
          if (!filename.endsWith("/")) {
            fileCount++;
          }
        }
      });
      if (!isRepo) {
        throw new Error("The ZIP file does not contain a Git repository.");
      }
      else {
        console.log("Extracting "+fileCount+" files")
        //Create all the folders first, then the files
        console.log("Creating folders")
        Object.keys(contents.files).forEach(function(filename) {
          if (filename.includes(".git/") && filename.endsWith("/")) {
            zip.files[filename].async('uint8array').then(function (fileData) {
              // console.log(filename)
              gitworker.postMessage({
                'cmd': 'createfolder',
                'folder_name': filename});
            });
          }
        });
        console.log("Creating files")
        Object.keys(contents.files).forEach(function(filename) {
          if (filename.includes(".git/") && !filename.endsWith("/")) {
            zip.files[filename].async('uint8array').then(function (fileData) {
              // console.log(filename)
              gitworker.postMessage({
                'cmd': 'createfile',
                'file_name': filename,
                'file_data': fileData});
            });
          }
        });
      }
    }
    catch (e) {
      alert("Error: "+e.message);
    }
  }, function() { alert("Not a valid zip file"); }); 
}