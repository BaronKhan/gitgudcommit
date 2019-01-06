#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/bind.h>
#include <string>
#include <utility>

#include "tagger.hpp"
#include "spell.hpp"
#include "gitgudcommit.hpp"

using namespace emscripten;

void jsInitPosTagger()
{
  GitGud::Tagger::getInstance().initPosTagger(
    "/core/models/brown-simplified.ngrams",
    "/core/models/brown-simplified.lexicon"
  );
}

void jsInitSpellChecker()
{
  GitGud::SpellChecker::getInstance().initSpellChecker(
    "/core/models/english-us.aff",
    "/core/models/english-us.dic"
  );
}

void jsAddFilename(const std::string & filename)
{
  GitGud::Commit::addFilename(filename);
}

void jsResetFilenames()
{
  GitGud::Commit::resetFilenames();
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("jsInitPosTagger", &jsInitPosTagger);
  function("jsInitSpellChecker", &jsInitSpellChecker);
  function("jsAddFilename", &jsAddFilename);
  function("jsResetFilenames", &jsResetFilenames);
  register_vector<std::string>("vector<string>");
  register_vector<unsigned>("vector<unsigned>");

  class_<GitGud::Commit>("Commit")
    .constructor< const std::string &, const std::string &,
                  const std::string &, long>()
    .property("author", &GitGud::Commit::getAuthor)
    .property("email", &GitGud::Commit::getEmail)
    .property("message", &GitGud::Commit::getMessage)
    .property("timestamp", &GitGud::Commit::getTimestamp)
    .function("getCommitScore", &GitGud::Commit::getCommitScore)
    .function("getSuggestions", &GitGud::Commit::getSuggestionsFull)
    ;
}

#endif