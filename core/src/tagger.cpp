#include <cstdio>
#include <fstream>

#include "ast.hpp"
#include "tagger.hpp"
#include "citar/corpus/TaggedWord.hh"
#include "citar/tagger/hmm/HMMTagger.hh"
#include "citar/tagger/hmm/LinearInterpolationSmoothing.hh"
#include "citar/tagger/hmm/Model.hh"
#include "citar/tagger/wordhandler/KnownWordHandler.hh"
#include "citar/tagger/wordhandler/SuffixWordHandler.hh"

namespace GitGud
{

  bool Tagger::initPosTagger(const std::string &ngrams, const std::string &lexicon)
  {
    if (m_initialised)
      return false;

    std::ifstream nGramStream(ngrams);
    if (!nGramStream.good())
    {
      std::cerr << "Could not open ngrams: " << ngrams << std::endl;
      return false;
    }

    std::ifstream lexiconStream(lexicon);
    if (!lexiconStream.good())
    {
      std::cerr << "Could not open lexicon: " << lexicon << std::endl;
      return false;
    }

    {
      using namespace std;
      using namespace citar::corpus;
      using namespace citar::tagger;

      shared_ptr<Model> model(Model::readModel(lexiconStream, nGramStream));

      // No need to manually free these as Singleton will be destroyed on termination
      SuffixWordHandler *suffixWordHandler = new SuffixWordHandler(model, 2, 2, 8);
      KnownWordHandler *knownWordHandler = new KnownWordHandler(model, suffixWordHandler);
      LinearInterpolationSmoothing *smoothing = new LinearInterpolationSmoothing(model);

      m_hmmTagger = new HMMTagger(model, knownWordHandler, smoothing);
    }

    std::cout << "Initialised POS tagger" << std::endl;

    m_initialised = true;
    return true;
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> Tagger::sentence2Vec(const std::string &sentence)
  {
    return Ast::split(sentence, ' '); //TODO: move the split function to common
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> Tagger::tagSentence(std::vector<std::string> sentence)
  {
    if (!m_initialised)
      return std::vector<std::string>();

    sentence.emplace(sentence.begin(), "<START>");
    sentence.emplace(sentence.begin(), "<START>");
    sentence.emplace_back("<END>");
    std::vector<std::string> tags = m_hmmTagger->tag(sentence);
    tags.erase(tags.begin());
    tags.erase(tags.begin());
    tags.pop_back();

    return tags;
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> Tagger::tagSentence(const std::string &sentence)
  {
    if (!m_initialised)
      return std::vector<std::string>();

    return tagSentence(sentence2Vec(sentence));
  }

  //////////////////////////////////////////////////////////////////////////////

  Tagger::~Tagger()
  {
    if (m_initialised)
      delete m_hmmTagger;
  }

}