#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdlib>
#include "gitgudcommit.hpp"
#include "tagger.hpp"
#include "spell.hpp"

#if defined(WIN32) || defined(_WIN32) || defined(__WIN32) && !defined(__CYGWIN__)
  static const std::string slash="\\";
#else
  static const std::string slash="/";
#endif

int main(int argc, char *argv[])
{
  if (argc < 2)
  {
    std::cerr << "usage: run the 'git commit' command" << std::endl;
    exit(EXIT_FAILURE);
  }

  if (system("exec < /dev/tty") != 0)
  {
    std::cerr << "gitgudcommit: could not get keyboard input" << std::endl;
    return 0;
  }

  std::string exec_dir(argv[0]);
  std::string working_dir;
  size_t lastindex = exec_dir.find_last_of(slash);
  if (lastindex != std::string::npos)
    working_dir = exec_dir.substr(0, lastindex);
  else
    working_dir = "";
  if (!GitGud::Tagger::getInstance().initPosTagger(
      working_dir+"/models/brown-simplified.ngrams",
      working_dir+"/models/brown-simplified.lexicon")
    || !GitGud::SpellChecker::getInstance().initSpellChecker(
      working_dir+"/models/english-us.aff",
      working_dir+"/models/english-us.dic")
  )
  {
    std::cerr << "gitgudcommit: could not initialise spell checker or POS tagger..."
      << std::endl;
    return 0;
  }

  for (;;)
  {
    std::ifstream commit_file(argv[1]);
    std::string msg((std::istreambuf_iterator<char>(commit_file)),
      std::istreambuf_iterator<char>());

    GitGud::Commit commit("", "", msg, 0);
    
    auto suggestions = commit.getSuggestions();
    if (suggestions.size() > 0)
    {
      std::cout << "The following commit message changes are advised:" << std::endl << std::endl;
      std::vector<std::pair<unsigned, std::string>>::const_iterator it;
      for (it=suggestions.begin(); it != suggestions.end(); ++it)
      {
        std::cout << "\t- Line " << it->first << ": " << it->second << std::endl;
      }
      std::cout << std::endl << "Are you sure you want to commit? [y/N] ";
      std::string input;
      std::cin >> input;
      if (tolower(input[0]) == 'n')
      {
        std::cout << std::endl << "Would you like to edit your message? [y/N] ";
        std::string input2;
        std::cin >> input2;
        if (tolower(input2[0]) == 'n')
        {
          std::cout << "Commit aborted." << std::endl;
          exit(EXIT_FAILURE);
        }
        else
        {
          std::cout << "Opening nano..." << std::endl;
          std::stringstream ss;
          ss << "nano " << argv[1];
          if (system(ss.str().c_str()) != 0)
            exit(EXIT_FAILURE);
          std::cout << "nano closed" << std::endl << std::endl;
        }
      }
      else
      {
        return 0;
      }
    }
  }
  return 0;
}