#ifndef GITGUDCOMMIT_HPP_
#define GITGUDCOMMIT_HPP_
#include <string>

#include "ast.hpp"

namespace GitGud
{
  
  class Commit
  {
  private:
    std::string         m_author;
    std::string         m_email;
    std::string         m_message;
    long long           m_timestamp;
    Ast                 *m_ast;

  public:
    Commit(
      std::string author, std::string email,
      std::string message, long long timestamp
    );

    std::string & getAuthor();
    std::string & getEmail();
    std::string & getMessage();
    long long getTimestamp() const;
    Ast * getAst() const;

    double getCommitScore() const;
  };

}

#endif