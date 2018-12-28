GitGudCommit
===

https://xkcd.com/1296/


![Git Commit](https://imgs.xkcd.com/comics/git_commit.png "Git Commit")

Linux Tool
---

#### Dependencies

```
$ sudo apt-get update
$ sudo apt-get install libgit2-dev libtbb-dev
$ cd linux
$ make bin/gitgudcommit
```

#### Usage

```
$ linux/bin/gitgudcommit <repository> <output file>
```

Web Tool
---

#### Dependencies

You need to have the [Emscripten SDK](https://kripken.github.io/emscripten-site/docs/tools_reference/emsdk.html)
installed, such that you are able to run the `emcc` command.

```
$ sudo apt-get update
$ sudo apt-get install libgit2-dev dos2unix nodejs
$ ./web/build_deps.sh
```

#### Usage

```
$ cd web/src
$ node git_http_proxy.js
```

The web server will be running at http://localhost:5000.