#ifndef TAGGER_HPP_
#define TAGGER_HPP_

#include <vector>
#include <string>
#include "citar/tagger/hmm/HMMTagger.hh"

namespace GitGud
{
  class Tagger
  {
  private:
    bool m_initialised;
    citar::tagger::HMMTagger *m_hmmTagger;

    Tagger() : m_initialised(false), m_hmmTagger(nullptr) {}
    ~Tagger();

  public:
    static Tagger & getInstance()
    {
      static Tagger instance;
      return instance;
    }

    Tagger(const Tagger &t)          = delete;
    void operator=(const Tagger &t)  = delete;

    bool initPosTagger(const std::string &ngrams, const std::string &lexicon);
    std::vector<std::string> sentence2Vec(const std::string &sentence);
    std::vector<std::string> tagWords(std::vector<std::string> words);
    std::vector<std::string> tagSentence(const std::string &sentence);
  };

}

#endif