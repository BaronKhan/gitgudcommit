#include "gitgudcommit.hpp"
#include "ast.hpp"

namespace GitGud
{

  Commit::Commit(
    std::string author, std::string email,
    std::string message, long long timestamp
  )
  : m_author(author), m_email(email), 
    m_message(message), m_timestamp(timestamp)
  {
    m_ast = new Ast();
    m_ast->parseMessage(m_message);
  }

  //////////////////////////////////////////////////////////////////////////////

  std::string & Commit::getAuthor()
  {
    return m_author;
  }

  //////////////////////////////////////////////////////////////////////////////

  std::string & Commit::getEmail()
  {
    return m_email;
  }

  //////////////////////////////////////////////////////////////////////////////

  std::string & Commit::getMessage()
  {
    return m_message;
  }

  //////////////////////////////////////////////////////////////////////////////

  long long Commit::getTimestamp() const
  {
    return m_timestamp;
  }

  //////////////////////////////////////////////////////////////////////////////

  Ast * Commit::getAst() const
  {
    return m_ast;
  }

  //////////////////////////////////////////////////////////////////////////////

  double Commit::getCommitScore() const
  {
    return 10.0;
  }

}