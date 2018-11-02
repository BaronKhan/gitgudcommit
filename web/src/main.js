const gitworker = new Worker("git_worker.js");

gitworker.addEventListener('message', function(e) {
  console.log(e.data);
}, false);

function cloneTest() {
  gitworker.postMessage({
    'cmd': 'clone', 
    'location': 'https://github.com/BaronKhan/chip8Emulator.git',
    'dir_name': 'chip8Emulator'});
}