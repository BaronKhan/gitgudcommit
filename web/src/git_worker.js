const startTime = new Date().getTime();
importScripts("libgit2.js");
var started = false;
Module['onRuntimeInitialized'] = () => {
    const dir="workdir";
    FS.mkdir(dir,"0777");
    FS.mount(IDBFS, {}, '/'+dir);
    FS.chdir("/"+dir);     
        
    console.log('libgit2 ready in webworker.',(new Date().getTime() - startTime),'ms startup time');
    jsgitinit();
    started = true;
};

self.addEventListener('message', function(e) {
  if (!started) { return; }
  var data = e.data;
  switch (data.cmd) {
    case 'clone':
      jsgitclone(data.location,data.dir_name);
      self.postMessage('cloned repository to '+data.dir_name);
      break;
    case 'chdir':
      FS.chdir(data.dir_name);
      break;
    case 'startwalk':
      jsgitstartwalk();
      self.postMessage('Starting walk');
      break;
    case 'walknextcommit':
      var commit;
      do {
        commit = jsgitwalknextcommit();
        if (commit != "___NULL___" && !commit.includes("Merge pull request")) {
          try {
            jsonObj = JSON.parse(commit
              .replace('&', 'amp;')
              .replace('\n', 'endl;')
              .replace('<', 'lt;')
              .replace('>', 'gt;')
              .replace('#', 'hash;')
              );
            jsonObj.message = jsonObj.message
              .replace('endl;', '\n')
              .replace('lt;', '<')
              .replace('gt;', '>')
              .replace('hash;', '#')
              .replace('amp;', '&');
            self.postMessage(jsonObj);
          } catch (e) {
            console.log("Error while parsing this commit:\n"+commit+"\n\n"+e.message);
            commit = "<UNKNOWN>";
          }
        }
      } while(commit.includes("Merge pull request") || commit.includes("<UNKNOWN>"));
      if (commit == "___NULL___") {
        self.postMessage("___NULL___")
      }
      break;
    case 'endwalk':
      jsgitendwalk();
      self.postMessage('Ending walk');
      break;
    case 'createfolder':
      var dir_name = data.folder_name;
      console.log(dir_name)
      subdirs = dir_name.split("/");
      console.log("subdirs = "+subdirs+"("+subdirs.length+")")
      var current_dir = "";
      for (var i = 0; i<subdirs.length; i++) {
        var old_dir = current_dir;
        try {
          Module['FS_createFolder']('/workdir/'+old_dir, subdirs[i], true, true);
        } catch(e) { console.log(subdirs[i]+": "+e.message); }
        current_dir += "/"+subdirs[i];
      }
      break;
    case 'createfile':
      console.log("Creating file with name: "+data.file_name)
      var base_name = baseName(data.file_name);
      var dir_name = data.file_name.substring(0,data.file_name.lastIndexOf("/")+1);
      console.log("base name = "+base_name+"; dir name = "+dir_name)
      try {
        Module['FS_createDataFile']('/workdir/'+dir_name, base_name, data.file_data, true, true, true);
      } catch(e) { console.log(base_name+": "+e.message); }
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);


function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}