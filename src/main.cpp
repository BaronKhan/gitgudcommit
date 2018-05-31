#include <iostream>
#include <fstream>
#include <git2.h>

int main(int argc, char *argv[])
{
  if (argc < 2) {
    std::cerr << "usage: gitgudcommit <repository> <output file>" << std::endl;
    exit(1);
  }

  try {
    std::string repo_location = argv[1];
    std::string output_name = argv[2];

    /* Check if repo_location is a git repo */
    std::ifstream gitfile(repo_location+"/.git");
    if (!gitfile.is_open()) { throw ".git was not found at " + repo_location; }
    gitfile.close();

    git_libgit2_init();
    git_libgit2_shutdown();

  } catch (std::string &msg) {
    std::cerr << "Caught exception : " << msg << std::endl;
    return 1;
  } catch (std::exception &e) {
    std::cerr << "Caught exception : " << e.what() << std::endl;
    return 1;
  } catch (...) {
    std::cerr << "Caught unknown exception." << std::endl;
    return 1;
  }

  return 0;
}
