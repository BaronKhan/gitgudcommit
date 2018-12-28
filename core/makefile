SHELL=/bin/bash

CPPFLAGS += -std=c++11 -W -Wall -g
CPPFLAGS += -O3
CPPFLAGS += -I include

# NB: gtest must be installed
LDFLAGS += /usr/lib/libgtest.a /usr/lib/libgtest_main.a -lpthread

all : bin/test_harness

bin/test_harness : src/*.cpp test/*.cpp
	-mkdir -p bin
	$(CXX) $(CPPFLAGS) -o $@ $^ $(LDFLAGS)