const coreworker = new Worker("core_worker.js");
const gitworker = new Worker("git_worker.js");

var currentCommit = {};
var commits = [];
var realCommitCount = -1;

// Each index corresponds to the commit element above
var scores = [];
var suggestions = [];
var averageScore = 0;
var timestamps = [];
var timestamps_copy = [];
var cummulativeAverage = [];

var getCommits = false;
var analysisInProgress = false;
var finishedWalk = false;

var cloneProgress = 0;
var analysisProgress = 0;

var fileCount = 0;
var repoName = "";
var files = [];

var reloading = false;

var gitReady = false;
var coreReady = false;

document.getElementById("gitGudButton").disabled = true;

resizeUrlBox();

coreworker.addEventListener('message', function(e) {
  var data = e.data;
  if (typeof data === 'object') {
    switch (data.type) {
      case "score":
        scores.push(data.data);
        break;
      case "suggestions":
        suggestions.push(data.data);
        break;
    }
    var scores_length = scores.length;
    analysisProgress = 25 + Math.ceil(((scores_length)*75.0)/commits.length);
    setProgressBar();
    // Calculate current average and cummulative average
    if (commits.length == scores_length && commits.length == suggestions.length) {
      console.log("All commits have been analysed");

      var sum = 0.0;
      var j = 0;
      for (var i = scores_length-1; i >= 0; i-=Math.floor(scores_length/100)+1) {
        sum += parseInt( scores[i], 10 );
        j++;
        averageScore = Math.round((sum/j) * 100) / 100;
        cummulativeAverage.push(averageScore);
      }
      populatePanel();
      updateScoreChart();
      analysisInProgress = false;
    }
  } else if (data == "___READY___") {
    coreReady = true;
    if (gitReady && coreReady)
      document.getElementById("gitGudButton").disabled = false;
  }
}, false);

gitworker.addEventListener('message', function(e) {
  if (typeof e.data === 'object') {
    if (e.data.hasOwnProperty('author')) {
      currentCommit = e.data;
      commits.push(currentCommit);
      if (analysisInProgress && !finishedWalk) {
        setProgressBar();
        analysisProgress = Math.min(analysisProgress+1, 25);
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
        files.push(e.data.file);
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
    } else if (e.data.hasOwnProperty('folder_processed')) {
      files.push(e.data.folder_processed);
      return;
    } else if (e.data.hasOwnProperty("___ERROR___")) {
      removeFailureAlert();
      removeSuccessAlert();
      removeWarningAlert();
      var error = e.data.___ERROR___;
      if (error.includes("exists"))
        createFailureAlert("You already cloned this repository. Please refresh \
          the page to try again.");
      else if (error.includes("packet length"))
        createFailureAlert("An error occurred while cloning the repository ("+error+").");
      else
        createFailureAlert(error);
      analysisInProgress = false;
      hideProgressBar();
    } else if (e.data.hasOwnProperty('all_files')) {
      files = e.data.all_files;
    } else if (e.data.hasOwnProperty("___TOOBIG___")) {
      if (!reloading) {
        reloading = true;
        // var estimated_size = Math.round(e.data.___TOOBIG___/31);
        alert("The repository is too big to clone. The maximum size is 150MB. Please use the 'Upload ZIP' feature.");
      }
      window.location.reload();
    }
  } else if (e.data == "___NULL___") {
    if (analysisInProgress) {
      finishedWalk = true;
      endWalk();
      analysisProgress = 25;
      console.log("Retrieved all commits");
      analyseCommits();
    }
  } else if (e.data == "___OPENED___" && getCommits) {
    walkCommits();
    getCommits = false;
  } else if (e.data == "___READY___") {
    gitReady = true;
    if (gitReady && coreReady)
      document.getElementById("gitGudButton").disabled = false;
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
  timestamps = [];
  cummulativeAverage = [];
  getCommits = true;
  cloneProgress = 0;
  analysisProgress = 0;
  fileCount = 0;
  repoName = "";
  files = [];
  coreworker.postMessage({ 'cmd': 'reset' })
  realCommitCount = -1;
  setProgressBar();
  removeSuccessAlert();
  removeFailureAlert();
  removeWarningAlert();
}

function analyseRepo(url) {
  if (analysisInProgress)
    return false;
  initCommitAnalysis();
  var dir_name = "";
  var regexp = /(https:\/\/|git@)github.com\/([a-zA-Z0-9\-\_\/]+|)/g;
  var match = regexp.exec(url);
  if (match && match.length > 2 && match[2] != "") {
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
  var limit = 20000;
  var numCommits = commits.length;
  if (numCommits > limit) {
    console.warn("Truncating number of commits from "+numCommits+" to "+limit);
    createWarningAlert("There are too many commits to analyse. Some commits will be skipped.");
    setTimeout(function() { removeWarningAlert(); }, 10000);
    realCommitCount = numCommits;
    commits = commits.slice(0, limit);
  }
  numCommits = commits.length;
  console.log("Total commits: "+numCommits);
  analysisProgress = 25;
  console.log("Filenames = "+files);
  coreworker.postMessage({ 'cmd': 'files', 'files': files })
  for (i=0; i<numCommits; i++) {
    var commit = commits[i];
    timestamps.push(epochToString(parseInt(commit.time)*1000));
    coreworker.postMessage({ 'cmd': 'analyse', 'commit': commit })
  }
  timestamps_copy = [];
  for (var i=0; i<timestamps.length; i+=Math.floor(timestamps.length/100)+1) {
    timestamps_copy.push(timestamps[i]);
  }
  timestamps_copy.reverse();
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
  var value = Math.ceil((cloneProgress * 0.3) + (analysisProgress * 0.7)) + '%';
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
      $("#tabSummary").attr('class', 'active');
      $("#tabSummary").show();
      $("#tabCommits").show();
      $("#tabTimeline").show();
      $("#tabCommits").removeClass();
      $("#tabTimeline").removeClass();
      $("#tabFAQ").removeClass();
      $("#summary").attr('class', 'tab-pane fade in active text-center');
      $("#commits").attr('class', 'tab-pane fade');
      $("#timeline").attr('class', 'tab-pane fade');
      $("#faq").attr('class', 'tab-pane fade');
      $("#panelAnalysis").fadeIn();
      removeWarningAlert();
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

function createWarningAlert(text) {
  if(document.getElementById("analyseWarning") == null) {
    var warningAlert = document.createElement("div");
    warningAlert.id = "analyseWarning";
    warningAlert.className="alert alert-warning alert-dismissible fade in text-center";
    warningAlert.innerHTML="<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>\
                            <strong>Warning: </strong> " + text;
    var panelRepo = document.getElementById("panelRepo");
    panelRepo.appendChild(warningAlert);
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

function removeWarningAlert() {
  var warningAlert = document.getElementById("analyseWarning");
  if(warningAlert != null) {
    warningAlert.remove();
  }
}

function populatePanel() {
  var rating = "";
  var rating_val = Math.round(averageScore);
  for (var i=0; i<5; i++) {
    if (i < rating_val)
      rating += "<span>&#x2605;</span>";
    else
      rating += "<span>&#x2606;</span>";
  }
  // console.log("rating = "+rating);
  $("#repoRating").html("This repository has a rating of "+averageScore+" out of 5.")
  $("#repoStars").html(rating);
  switch (rating_val) {
    case 1:
      $("#repoComment").html("<p>A poorly maintained repository with weak commit messages.</p><small>Want to write better commits? Check out the <a target=\"_blank\" href=\"https://github.com/BaronKhan/gitgudcommit\">Git Gud Commit tool suite</a>.</small>")
      break;
    case 2:
      $("#repoComment").html("<p>A weak repository with below-average commit messages.</p><small>Want to write better commits? Check out the <a target=\"_blank\" href=\"https://github.com/BaronKhan/gitgudcommit\">Git Gud Commit tool suite</a>.</small>")
      break;
    case 3:
      $("#repoComment").html("<p>A well-maintained repository with adequate commit messages.</p><small>Want to write better commits? Check out the <a target=\"_blank\" href=\"https://github.com/BaronKhan/gitgudcommit\">Git Gud Commit tool suite</a>.</small>")
      break;
    case 4:
      $("#repoComment").html("<p>A high quality repository with well-written commit messages.</p><small>Want to write better commits? Check out the <a target=\"_blank\" href=\"https://github.com/BaronKhan/gitgudcommit\">Git Gud Commit tool suite</a>.</small>")
      break;
    case 5:
      $("#repoComment").html("<p>A near-perfect repository with excellent commit messages.</p>")
      break;
  }

  var urlInput = document.getElementById("urlInput").value;
  if (urlInput.includes("http"))
    $("#twitterLink").attr("href", "http://twitter.com/share?text=My Git repository at "+urlInput+" has a rating of "+averageScore+" out of 5. Check out the quality of your own Git repositories at&url=http://gitgudcommit.com&hashtags=GitGud")
  else
    $("#twitterLink").attr("href", "http://twitter.com/share?text=My '"+urlInput+"' Git repository has a rating of "+averageScore+" out of 5. Check out the quality of your own Git repositories at&url=http://gitgudcommit.com&hashtags=GitGud")

  if (realCommitCount != -1)
    $("#commitCount").html(commits.length+" Commits Found (out of "+realCommitCount+")");
  else
    $("#commitCount").html(commits.length+" Commits Found");

  if ($(window).width() >= 1000) {
    $("#tableHeadData").html("\
      <tr> \
        <th>Author</th> \
        <th>Date</th> \
        <th>Message</th> \
        <th>Rating</th> \
        <th>Suggestions</th> \
      </tr>");
  } else {
    $("#tableHeadData").html("\
      <tr> \
        <th>Message</th> \
        <th>Rating</th> \
        <th>Suggestions</th> \
      </tr>");
  }

  var tableData = "";
  for (var i=0; i < commits.length; i++) {
    var commit = commits[i];
    var score = scores[i];
    var suggestion = suggestions[i];
    tableData += "<tr>";
    if ($(window).width() >= 1000) {
      tableData += "<td>"+commit.author+"</td>";
      tableData += "<td>"+epochToString(parseInt(commit.time)*1000)+"</td>";
      tableData += "<td><pre>"+commit.message.replaceAll("\r\n", "<br>")
                        .replaceAll("\n", "<br>")+"</pre></td>";
    } else {
      tableData += "<td style=\"font-size:11px\">"+commit.message
                      .replaceAll("\r\n", "<br>").replaceAll("\n", "<br>")+"</td>";
    }
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

function epochToString(epoch) {
  var d = new Date(epoch);
  function twoDigits(value) { return ("0" + value).slice(-2); }
  return twoDigits(d.getUTCDate())+"/"+twoDigits(d.getUTCMonth()+1)+"/"+
    d.getUTCFullYear()+" "+twoDigits(d.getUTCHours())+":"+
    twoDigits(d.getUTCMinutes());
}

setInterval(function() {
  if (!analysisInProgress) {
    hideProgressBar();
  }
}, 5000);

// // Execute a function when the user releases a key on the keyboard
// document.getElementById("urlInput").addEventListener("keyup", function(event) {
//   // Cancel the default action, if needed
//   event.preventDefault();
//   // Number 13 is the "Enter" key on the keyboard
//   if (event.keyCode === 13) {
//     document.getElementById("gitGudButton").click();
//   }
// });

onUrlBoxClick = function() {
  var value = $("#urlInput").get(0).value;
  if (value == "")
    $("#urlInput").val("https://github.com/")
}