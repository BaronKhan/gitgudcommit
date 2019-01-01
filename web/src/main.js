const coreworker = new Worker("core_worker.js");
const gitworker = new Worker("git_worker.js");

var currentCommit = {};
var commits = [];

// Each index corresponds to the commit element above
var scores = [];
var suggestions = [];
var averageScore = 0;
var cummulativeAverage = [];

var getCommits = false;
var analysisInProgress = false;
var finishedWalk = false;

var cloneProgress = 0;
var analysisProgress = 0;

var fileCount = 0;
var repoName = "";

resizeUrlBox();

coreworker.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.type) {
    case "score":
      scores.push(data.data);
      break;
    case "suggestions":
      suggestions.push(data.data);
      break;
  }
  var scores_length = scores.length;
  analysisProgress = 50 + Math.ceil(((scores_length)*50.0)/commits.length);
  setProgressBar();
  // Calculate current average and cummulative average
  var sum = 0.0;
  for (var i = 0; i < scores_length; i++) {
      sum += parseInt( scores[i], 10 );
  }
  averageScore = sum/scores_length;
  cummulativeAverage.push(averageScore);
  if (commits.length == scores_length && commits.length == suggestions.length) {
    console.log("All commits have been analysed");
    populatePanel();
    analysisInProgress = false;
  }
}, false);

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
      return;
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
  currentCommit = {};
  commits = [];
  scores = [];
  suggestions = [];
  cummulativeAverage = [];
  getCommits = true;
  cloneProgress = 0;
  analysisProgress = 0;
  fileCount = 0;
  repoName = "";
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
  analysisProgress = 50;
  for (i=0; i<numCommits; i++) {
    var commit = commits[i];
    coreworker.postMessage({ 'cmd': 'analyse', 'commit': commit })
  }
  console.log("Commits sent to core worker");
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
  analysedCommits = [];
  scores = [];
  suggestions = [];
  cummulativeAverage = [];
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
  var value = Math.ceil((cloneProgress * 0.75) + (analysisProgress * 0.25)) + '%';
  elem.style.width = value;
  elem.innerHTML = value;

  var block = document.getElementById("cloneProgress");
  var loading = document.getElementById("loadingImg");
  if (analysisInProgress) {
    $("#cloneProgress").fadeIn();
    $("#loadingImg").fadeIn();
    document.getElementById("panelAnalysis").style.display = "none";
  }
  if (value == "100%") {
    setTimeout(function(){
      block.style.display = "none";
      loading.style.display = "none";
      $("#panelAnalysis").fadeIn();
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

function populatePanel() {
  $("#commitCount").html(commits.length+" Commits Found");

  var tableData = "";
  for (var i=0; i < commits.length; i++) {
    var commit = commits[i];
    var score = scores[i];
    var suggestion = suggestions[i];
    tableData += "<tr>";
    tableData += "<td>"+commit.author+"</td>";
    var d = new Date(parseInt(commit.time*1000));
    function twoD(value) {
      return ("0" + value).slice(-2);
    }
    tableData += "<td>"+twoD(d.getUTCDate())+"/"+twoD(d.getUTCMonth()+1)+"/"+
                    d.getUTCFullYear()+" "+twoD(d.getUTCHours())+":"+
                    twoD(d.getUTCMinutes())+"</td>";
    tableData += "<td><pre>"+commit.message.replaceAll("\r\n", "<br>").replaceAll("\n", "<br>")+"</pre></td>";
    tableData += "<td>"+Math.round(score * 100) / 100+" / 5</td>";
    tableData += "<td><ul>";
    for (var j=0; j<suggestion.length; j++) {
      tableData += "<li>"+suggestion[j]+"</li>";
    }
    tableData += "</ul></td>";
    tableData += "</tr>\n";
  }
  $("#tableBodyData").html(tableData);
}

$(window).resize(function() {
  resizeUrlBox();
});

function resizeUrlBox() {
  var urlInput = document.getElementById("urlInput");
  if ($(window).width() < 770) {
    urlInput.style.width=(document.body.offsetWidth-2)+"px"; //I have no idea if this is valid but it seems to work.
    urlInput.className="form-control text-center";
  } else {
    urlInput.style.width="358px";
    urlInput.className="form-control";
  }
}

$(document).ready(function () {
  $("#commitSearchInput").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#tableBodyData tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
