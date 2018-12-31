#!/bin/bash
cd "$(dirname "$0")"

echo "building libgit2.js and libgit2.wasm"
./deps/build-deps.sh
echo "built libgit2.js and libgit2.wasm"

echo "building libcitar_web.a"
./../core/deps/build-deps.sh
echo "built libcitar_web.a"

echo "building gitgudcore.js, gitgudcore.wasm and gitgudcore.data"

em++ -s ALLOW_MEMORY_GROWTH=1 -s ASSERTIONS=1 -s FORCE_FILESYSTEM=1 \
-s "EXTRA_EXPORTED_RUNTIME_METHODS=['FS']" --std=c++11 --bind \
--preload-file ../core/models -Oz jsgitgudcore.cpp ../core/src/*.cpp \
../core/lib/libcitar_web.a -I../core/include -I../core/deps/citar-cxx/include \
-I../core/deps/citar-cxx/build/include -o src/gitgudcore.js

echo "built gitgudcore.js, gitgudcore.wasm and gitgudcore.data"