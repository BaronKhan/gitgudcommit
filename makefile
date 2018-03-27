SHELL=/bin/bash

CPPFLAGS += -std=c++11 -W -Wall  -g
CPPFLAGS += -O3
CPPFLAGS += -I include

all : bin/gitgudcommit

bin/gitgudcommit : src/*.cpp
	-mkdir -p bin
	$(CXX) $(CPPFLAGS) -o $@ $^