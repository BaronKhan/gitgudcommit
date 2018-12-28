Web Tool
===

### Dependencies

You need to have the [Emscripten SDK](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)
installed, such that you are able to run the `emcc` and `em++` commands.

```
$ sudo apt-get update
$ sudo apt-get install libgit2-dev dos2unix nodejs cmake
$ ./deps/build_deps.sh
```

### Usage

```
$ cd src
$ node git_http_proxy.js
```

The web server will be running at http://localhost:5000.