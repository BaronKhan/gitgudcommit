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
$ make bin/gitgudcommit
```

#### Usage

```
$ bin/gitgudcommit <repository> <output file>
```

Web Tool
---

#### Dependencies

```
$ sudo apt-get update
$ sudo apt-get install libgit2-dev dos2unix nodejs
$ cd web/deps
$ ./build_deps.sh
```

#### Usage

```
$ cd src
$ node githttpproxy.js
```

The web server will be running at https://localhost:5000.