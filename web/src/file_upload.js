document.getElementById("uploadZip").onchange = function() {
  if (analysisInProgress)
    return;
  initCommitAnalysis();
  gitworker.postMessage({'cmd': 'resetcount'})
  var zip = new JSZip();
  fileCount = 0;

  try {

    if(this.files[0].size > 1073741824){
       throw new Error("File is too big! The maximum file size is 1 GB. \
        Tip: create an archive of a bare repository (git clone --bare <url>) contained in a .git folder.");
    };

    zip.loadAsync(this.files[0]).then(function(contents) {
      // process ZIP file content here
        var isRepo = false;
        Object.keys(contents.files).forEach(function(filename) {
          var pattern = ".git/";
          if (filename.includes(pattern)) {
            if (!isRepo) {
              repoName = filename.substr(0, filename.indexOf(pattern));
              var urlInput = document.getElementById("urlInput");
              urlInput.value = repoName.substring(0, repoName.length - 1);
              isRepo = true;
            }
          }

          if (!filename.endsWith("/")) {
            fileCount++;
          }
        });
        if (!isRepo) {
          createFailureAlert("The ZIP file does not contain a Git repository.");
          this.value = "";
          analysisInProgress = false;
          hideProgressBar();
        }
        else {
          console.log("Extracting "+fileCount+" files")
          //Create all the folders first, then the files
          console.log("Creating folders")
          Object.keys(contents.files).forEach(function(filename) {
            if (/*filename.includes(".git/") && */filename.endsWith("/")) {
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
            if (/*filename.includes(".git/") && */!filename.endsWith("/")) {
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
    }, function() {
      createFailureAlert("ZIP file does not contain a Git Repository.");
      this.value = "";
      analysisInProgress = false;
      hideProgressBar();
    });
  } catch (e) {
    createFailureAlert(e.message);
    this.value = "";
    analysisInProgress = false;
    hideProgressBar();
  }
}