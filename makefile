SHELL=/bin/bash

CPPFLAGS += -std=c++11 -W -Wall -g
CPPFLAGS += -O3
CPPFLAGS += -I include
CPPFLAGS += -L lib

LDFLAGS += -lgit2

all : bin/gitgudcommit

bin/gitgudcommit : src/*.cpp
	-mkdir -p bin
	$(CXX) $(CPPFLAGS) -o $@ $^ $(LDFLAGS)
