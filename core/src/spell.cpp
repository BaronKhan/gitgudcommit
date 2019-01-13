#include <iostream>
#include <algorithm>

#include "spell.hpp"

namespace GitGud
{

  bool SpellChecker::initSpellChecker(const std::string &aff, const std::string &dic)
  {
    if (m_initialised)
      return false;

    m_spell = new Hunspell(aff.c_str(), dic.c_str());

    // std::cout << "Initialised spell checker" << std::endl;

    m_initialised = true;
    return true;
  }

  //////////////////////////////////////////////////////////////////////////////

  bool SpellChecker::spellingError(const std::string &word)
  {
    if (word.find(".") != std::string::npos || word.find("()") != std::string::npos)
      return false;
    std::string raw;
    std::remove_copy_if(word.begin(), word.end(),            
      std::back_inserter(raw),           
      std::ptr_fun<int, int>(&std::ispunct)  
    );
    if (std::all_of(raw.begin(), raw.end(), isupper))
      return false;
    return (m_spell->spell(raw) == 0);
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> SpellChecker::spellingSuggestion(const std::string &word)
  {
    std::string raw;
    std::remove_copy_if(word.begin(), word.end(),            
      std::back_inserter(raw),           
      std::ptr_fun<int, int>(&std::ispunct)  
    );
    return m_spell->suggest(raw);
  }

  //////////////////////////////////////////////////////////////////////////////

  SpellChecker::~SpellChecker()
  {
    if (m_initialised)
      delete m_spell;
  }

}