SHELL=/bin/bash

CPPFLAGS += -std=c++11 -W -Wall -g
CPPFLAGS += -O3
CPPFLAGS += -I include -I deps/citar-cxx/include -I deps/citar-cxx/build/include \
-I w/hunspell/src

# NB: gtest must be installed
LDFLAGS += /usr/lib/libgtest.a /usr/lib/libgtest_main.a lib/libcitar.a \
lib/libhunspell-1.7.a -lpthread

all : bin/test_harness

bin/test_harness : src/*.cpp test/*.cpp
	-dos2unix deps/build-deps.sh
	./deps/build-deps.sh
	-mkdir -p bin
	$(CXX) $(CPPFLAGS) -o $@ $^ $(LDFLAGS)