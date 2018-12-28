Test Harness
===

### Dependencies

The test harness uses the [Google Test](https://www.eriksmistad.no/getting-started-with-google-test-on-ubuntu/)
framework which must be installed. Below are the steps to install it:

```
$ sudo apt-get install libgtest-dev cmake
$ cd /usr/src/gtest
$ sudo cmake CMakeLists.txt
$ sudo make
$ sudo cp *.a /usr/lib
$ cd -
```

### Usage

```
$ make bin/test_harness
$ bin/test_harness
```