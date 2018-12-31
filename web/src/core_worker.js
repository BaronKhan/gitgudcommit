const startTime = new Date().getTime();

importScripts("gitgudcore.js");

Module['onRuntimeInitialized'] = () => {
  const dir="workdir";
  FS.mkdir(dir,"0777");
  FS.mount(IDBFS, {}, '/'+dir);
  FS.chdir("/"+dir);
  console.log('gitgudcore ready in webworker.',(new Date().getTime() - startTime),'ms startup time');
  Module.jsInitPosTagger();
  started = true;
};