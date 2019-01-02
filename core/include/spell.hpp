#ifndef GITGUDSPELLING_HPP_
#define GITGUDSPELLING_HPP_

#include <string>
#include "hunspell/hunspell.hxx"

namespace GitGud
{
  class SpellChecker
  {
  private:
    bool m_initialised;
    Hunspell *m_spell;

    SpellChecker() : m_initialised(false), m_spell(nullptr) {}
    ~SpellChecker();

  public:
    static SpellChecker & getInstance()
    {
      static SpellChecker instance;
      return instance;
    }

    SpellChecker(const SpellChecker &t)          = delete;
    void operator=(const SpellChecker &t)        = delete;

    bool initSpellChecker(const std::string &aff, const std::string &dic);
    bool spellingError(const std::string &word);
    std::vector<std::string> spellingSuggestion(const std::string &word);
  };

}

#endif