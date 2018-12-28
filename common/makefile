SHELL=/bin/bash

CPPFLAGS += -std=c++11 -W -Wall -g
CPPFLAGS += -O3
CPPFLAGS += -I include

all : bin/test_harness

bin/test_harness : src/*.cpp test/*.cpp
	-mkdir -p bin
	$(CXX) $(CPPFLAGS) -o $@ $^