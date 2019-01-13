SHELL=/bin/bash

CPPFLAGS += -std=c++11 -W -Wall -g
CPPFLAGS += -O3
CPPFLAGS +=  -I ../core/include -I ../core/deps/citar-cxx/include \
-I ../core/deps/citar-cxx/build/include -I ../core/deps/hunspell/src

LDFLAGS += ../core/lib/libcitar.a ../core/lib/libhunspell-1.7.a -lpthread

all : bin/check-msg

bin/check-msg : ../core/src/*.cpp src/*.cpp
	-mkdir -p bin
	$(CXX) $(CPPFLAGS) -o $@ $^ $(LDFLAGS)

install :
	-mkdir -p ~/.gitgudcommit
	cp src/commit-msg ~/.gitgudcommit/.
	cp bin/check-msg ~/.gitgudcommit/.
	chmod +x ~/.gitgudcommit/check-msg
	cp -R ../core/models ~/.gitgudcommit/.
	git config --global core.hooksPath ~/.gitgudcommit