const gitworker = new Worker("git_worker.js");
const coreworker = new Worker("core_worker.js");

var currentCommit = {};
var commits = [];

var getCommits = false;
var analysisInProgress = false;
var finishedWalk = false;

var cloneProgress = 0;
var analysisProgress = 0;

var fileCount = 0;
var repoName = "";

resizeUrlBox();

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
      if (fileCount > 0) {
        //NB: clone progress is file processed here
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
    } else if (e.data.hasOwnProperty("___ERROR___")) {
      removeFailureAlert();
      removeSuccessAlert();
      createFailureAlert(e.data.___ERROR___);
      analysisInProgress = false;
      hideProgressBar();
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

function analyseUrl() {
  var urlInput = document.getElementById("urlInput");
  analyseRepo(urlInput.value);
}

function initCommitAnalysis() {
  analysisInProgress = true;
  getCommits = true;
  cloneProgress = 0;
  analysisProgress = 0;
  setProgressBar();
  removeSuccessAlert();
  removeFailureAlert();
}

function analyseRepo(url) {
  if (analysisInProgress)
    return false;
  initCommitAnalysis();
  var dir_name = "";
  var regexp = /(https:\/\/|git@)github.com\/([a-zA-Z0-9\-\_\/]+|)/g;
  var match = regexp.exec(url);
  if (match && match.length > 2) {
    dir_name = match[2];
    clone(url, dir_name);
  } else {
    createFailureAlert("Invalid GitHub URL.");
    analysisInProgress = false;
    hideProgressBar();
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
  if (commits.length < 1) {
    createFailureAlert("The repository has no commits.");
    analysisInProgress = false;
    hideProgressBar();
    return;
  }
  var numCommits = commits.length;
  console.log("Total commits: "+numCommits);
  for (i=0; i<numCommits; i++) {
    var commit = commits[i];
    analysisProgress = 50 + Math.ceil(((i+1)*50.0)/numCommits);
    setProgressBar();
  }
  console.log("Finished analysing commits");
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
  var value = Math.ceil((cloneProgress * 0.8) + (analysisProgress * 0.2)) + '%';
  elem.style.width = value;
  elem.innerHTML = value;

  var block = document.getElementById("cloneProgress");
  var loading = document.getElementById("loadingImg");
  if (analysisInProgress)
    block.style.display = "";
    loading.style.display = "";
  if (value == "100%") {
    setTimeout(function(){
      block.style.display = "none";
      loading.style.display = "none";
      createSuccessAlert("The Git repository has been analysed.");
    }, 1000);
  }
}

function hideProgressBar() {
  var block = document.getElementById("cloneProgress");
  var loading = document.getElementById("loadingImg");
  block.style.display = "none";
  loading.style.display = "none";
}

function getProgressBar() {
  var elem = document.getElementById("cloneProgressBar");   
  return elem.style.width;
}

function createSuccessAlert(text) {
  if(document.getElementById("analyseSuccess") == null) {
    var successAlert = document.createElement("div");
    successAlert.id = "analyseSuccess";
    successAlert.className="alert alert-success alert-dismissible fade in text-center";
    successAlert.innerHTML="<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>\
                            <strong>Success!</strong> " + text;
    var panelRepo = document.getElementById("panelRepo");
    panelRepo.appendChild(successAlert);
  }
}

function createFailureAlert(text) {
  if(document.getElementById("analyseFailure") == null) {
    var failureAlert = document.createElement("div");
    failureAlert.id = "analyseFailure";
    failureAlert.className="alert alert-danger alert-dismissible fade in text-center";
    failureAlert.innerHTML="<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>\
                            <strong>Error:</strong> " + text;
    var panelRepo = document.getElementById("panelRepo");
    panelRepo.appendChild(failureAlert);
  }
}

function removeSuccessAlert() {
  var successAlert = document.getElementById("analyseSuccess");
  if(successAlert != null) {
    successAlert.remove();
  }
}

function removeFailureAlert() {
  var failureAlert = document.getElementById("analyseFailure");
  if(failureAlert != null) {
    failureAlert.remove();
  }
}

$(window).resize(function() {
  resizeUrlBox();
});

function resizeUrlBox() {
  var urlInput = document.getElementById("urlInput");
  if ($(window).width() < 770) {
    urlInput.style.width=(document.body.offsetWidth-2)+"px"; //I have no idea if this is valid but it seems to work.
  } else {
    urlInput.style.width="358px";
  }
}