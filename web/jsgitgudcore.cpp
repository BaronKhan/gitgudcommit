#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/bind.h>
#include <string>

#include "tagger.hpp"
#include "gitgudcommit.hpp"

using namespace emscripten;

void jsInitPosTagger()
{
  GitGud::Tagger::getInstance().initPosTagger(
    "/core/models/brown-simplified.ngrams",
    "/core/models/brown-simplified.lexicon"
  );
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("jsInitPosTagger", &jsInitPosTagger);
  register_vector<std::string>("vector<string>");
  register_vector<std::pair<unsigned, std::string>>("vector<pair<unsigned, string>>");

  class_<GitGud::Commit>("Commit")
    .constructor< const std::string &, const std::string &,
                  const std::string &, long>()
    .property("author", &GitGud::Commit::getAuthor)
    .property("email", &GitGud::Commit::getEmail)
    .property("message", &GitGud::Commit::getMessage)
    .property("timestamp", &GitGud::Commit::getTimestamp)
    .function("getCommitScore", &GitGud::Commit::getCommitScore)
    .function("getSuggestions", &GitGud::Commit::getSuggestions)
    ;
}

#endif