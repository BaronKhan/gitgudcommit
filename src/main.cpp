#include <iostream>
#include <fstream>

int main(int argc, char *argv[])
{
  if(argc < 2) {
    fprintf(stderr, "usage: gitgudcommit <repository> <output file>\n");
    exit(1);
  }

  try {
    std::string repo_location = argv[1];
    std::string output_name = argv[2];

    std::ifstream gitfile(repo_location+"/.git");
    if (!gitfile.is_open()) { throw ".git was not found at " + repo_location; }
    gitfile.close();

  } catch(std::string &msg) {
    std::cerr << "Caught exception : " << msg << std::endl;
    return 1;
  } catch(std::exception &e) {
    std::cerr << "Caught exception : " << e.what() << std::endl;
    return 1;
  } catch(...) {
    std::cerr << "Caught unknown exception." << std::endl;
    return 1;
  }

  return 0;
}