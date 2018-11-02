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
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);