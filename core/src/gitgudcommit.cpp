#include <vector>
#include "gitgudcommit.hpp"
#include "ast.hpp"

namespace GitGud
{

  Commit::Commit(
    const std::string &author, const std::string &email,
    const std::string &message, long long timestamp
  )
  : m_author(author), m_email(email), 
    m_message(message), m_timestamp(timestamp)
  {
    m_ast = new Ast(message);
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & Commit::getAuthor() const
  {
    return m_author;
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & Commit::getEmail() const
  {
    return m_email;
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & Commit::getMessage() const
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
    return m_ast->getCommitScore();
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::pair<unsigned, std::string>> & Commit::getSuggestions()
  {
    return m_ast->getSuggestions();
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> Commit::getSuggestionsFull()
  {
    return m_ast->getSuggestionsFull();
  }

  //////////////////////////////////////////////////////////////////////////////

  void Commit::addFilename(const std::string & filename)
  {
    Ast::addFilename(filename);
  }

  //////////////////////////////////////////////////////////////////////////////

  void Commit::resetFilenames()
  {
    Ast::resetFilenames();
  }

}