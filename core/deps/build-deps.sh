#!/bin/bash

# Execute in script directory
cd "$(dirname "$0")"

if [ -z "$(ls -A citar-cxx)" ]; then
  echo "initialising citar-cxx submodule"
  git submodule init
  echo "updating submodules"
  git submodule foreach git pull origin master
  git submodule update
fi

mkdir -p ../lib ../models

echo "copying models"
cp citar-cxx/models/brown/brown* ../models/.

cd citar-cxx/build
dos2unix build.sh
echo "running build.sh in build"
./build.sh
echo "copying libcitar.a"
cp libcitar.a ../../../lib/.
cd -

cd citar-cxx/emscripten_hacks
dos2unix build.sh
echo "running build.sh in emscripten_hacks"
./build.sh
echo "copying libcitar_web.a"
cp libcitar.a ../../../lib/libcitar_web.a
echo "built libcitar_web.a with emscripten hacks and copied to core"

echo "done"