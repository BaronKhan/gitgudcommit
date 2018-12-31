#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;

#include "tagger.hpp"

void jsInitPosTagger()
{
  GitGud::Tagger::getInstance().initPosTagger(
    "/core/models/brown-simplified.ngrams",
    "/core/models/brown-simplified.lexicon"
  );
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("jsInitPosTagger", &jsInitPosTagger);
}

#endif