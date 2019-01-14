#!/bin/bash

# Execute in script directory
cd "$(dirname "$0")"

echo "building citar-cxx"

if [ -z "$(ls -A citar-cxx)" ] || [ -z "$(ls -A hunspell)" ]; then
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
if [ ! -f ../../../lib/libcitar.a ]; then
  dos2unix build.sh
  echo "running build.sh in build"
  ./build.sh
  echo "copying libcitar.a"
  cp libcitar.a ../../../lib/.
fi
cd -

cd citar-cxx/emscripten_hacks
if [ ! -f ../../../lib/libcitar_web.a ]; then
  dos2unix build.sh
  echo "running build.sh in emscripten_hacks"
  ./build.sh
  echo "copying libcitar_web.a"
  cp libcitar.a ../../../lib/libcitar_web.a
  echo "built libcitar_web.a with emscripten hacks and copied to core"
fi
echo "done building citar-cxx"

cd ../../hunspell

if [ ! -f ../../lib/libhunspell-1.7.a ]; then
  echo "building hunspell"
  dos2unix *
  autoreconf -vfi
  ./configure
  make
  cp src/hunspell/.libs/libhunspell-1.7.a ../../lib/.
  echo "finished building libhunspell-1.7.a"
  git reset --hard origin/master
  git clean -fd
  rm -f README
  ln -s README.md README
fi

if [ ! -f ../../lib/libhunspell-1.7_web.a ]; then
  echo "building hunspell (web)"
  dos2unix *
  autoreconf -vfi
  emconfigure ./configure
  emmake make
  cp src/hunspell/.libs/libhunspell-1.7.a ../../lib/libhunspell-1.7_web.a
  echo "finished building libhunspell-1.7_web.a"
  git reset --hard origin/master
  git clean -fd
  rm -f README
  ln -s README.md README
fi

echo "done"