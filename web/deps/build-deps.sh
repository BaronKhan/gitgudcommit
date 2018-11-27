#!/bin/bash

if [ ! -d ../deps ]; then
  echo "execute in deps directory"
  exit
fi

# if [ ! -d libgit2 ]; then
#   git clone https://github.com/BaronKhan/libgit2
# fi

if [ -z "$(ls -A libgit2)" ]; then
  echo "initialising libgit2 submodule"
  git submodule init
  echo "updating submodules"
  git submodule foreach git pull origin master
  git submodule update
fi

cd libgit2/emscripten_hacks
dos2unix build.sh
echo "running build.sh"
./build.sh
echo "copying libgit2.js libgit2.wasm"
cp libgit2.js libgit2.wasm ../../../src/.
cd ..
echo "done"