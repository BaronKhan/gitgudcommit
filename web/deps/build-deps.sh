#!/bin/bash

# Execute in script directory
cd "$(dirname "$0")"

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