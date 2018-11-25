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
          self.postMessage(JSON.parse(commit
            .replace('&', '&amp;')
            .replace('\n', '&endl;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('#', '&hash;')
            ));
        }
      } while(commit.includes("Merge pull request"));
      break;
    case 'endwalk':
      jsgitendwalk();
      self.postMessage('Ending walk');
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);