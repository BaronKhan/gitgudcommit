#!/bin/bash

if [ ! -d ../deps ]; then
  echo "Execute in deps directory"
  exit
fi

if [ ! -d libgit2 ]; then
  git clone https://github.com/BaronKhan/libgit2
fi

cd libgit2/emscripten_hacks
dos2unix build.sh
echo "running build.sh"
./build.sh
echo "copying libgit2.js libgit2.wasm"
cp libgit2.js libgit2.wasm ../../../src/.
cd ..
echo "done"