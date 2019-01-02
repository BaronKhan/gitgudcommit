#include <iostream>

#include "spell.hpp"

namespace GitGud
{

  bool SpellChecker::initSpellChecker(const std::string &aff, const std::string &dic)
  {
    if (m_initialised)
      return false;

    m_spell = new Hunspell(aff.c_str(), dic.c_str());

    std::cout << "Initialised spell checker" << std::endl;

    m_initialised = true;
    return true;
  }

  //////////////////////////////////////////////////////////////////////////////

  bool SpellChecker::spellingError(const std::string &word)
  {
    return (m_spell->spell(word) == 0);
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> SpellChecker::spellingSuggestion(const std::string &word)
  {
    return m_spell->suggest(word);
  }

  //////////////////////////////////////////////////////////////////////////////

  SpellChecker::~SpellChecker()
  {
    if (m_initialised)
      delete m_spell;
  }

}