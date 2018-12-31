#ifndef GITGUDCOMMIT_HPP_
#define GITGUDCOMMIT_HPP_

#include <string>
#include <vector>
#include "ast.hpp"

namespace GitGud
{
  
  class Commit
  {
  private:
    const std::string         m_author;
    const std::string         m_email;
    const std::string         m_message;
    const long long           m_timestamp;
    Ast                      *m_ast;

  public:
    Commit(
      const std::string &author, const std::string &email,
      const std::string &message, long long timestamp
    );

    const std::string & getAuthor() const;
    const std::string & getEmail() const;
    const std::string & getMessage() const;
    long long getTimestamp() const;
    Ast * getAst() const;

    double getCommitScore() const;
    std::vector<std::pair<unsigned, std::string>> & getSuggestions();
    std::vector<std::string> getSuggestionsMessages();
    std::vector<unsigned> getSuggestionsLines();
  };

}

#endif