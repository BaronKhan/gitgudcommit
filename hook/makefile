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
	chmod +x bin/check-msg
	chmod +x src/commit-msg
	-mkdir -p ~/.gitgudcommit/hooks
	cp -R src/commit-msg bin/check-msg ../core/models ~/.gitgudcommit/hooks/.
	if [ -d "/usr/share/git-core/templates/hooks" ]; then cp -R src/commit-msg /usr/share/git-core/templates/hooks/.; fi
	if [ -d "/usr/local/share/git-core/templates/hooks" ]; then cp -R src/commit-msg /usr/local/share/git-core/templates/hooks/.; fi
	git config --global core.hooksPath ~/.gitgudcommit/hooks