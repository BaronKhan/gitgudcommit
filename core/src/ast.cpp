#include <sstream>
#include <algorithm>
#include <cctype>

#include "ast.hpp"

namespace GitGud
{

  std::vector<std::string> Ast::split(const std::string &s, char delim)
  {
    std::stringstream ss(s);
    std::string item;
    std::vector<std::string> tokens;
    while (std::getline(ss, item, delim))
      tokens.push_back(item);

    return tokens;
  }

  //////////////////////////////////////////////////////////////////////////////

  Ast::Ast(const std::string &message) : m_score(0.0)
  {
    parseMessage(message);
    calculateCommitScore();
  }

  //////////////////////////////////////////////////////////////////////////////

  void Ast::parseMessage(const std::string &message)
  {
    std::vector<std::string> lines = Ast::split(message, '\n');
    MessageNode* title_node = new TitleNode(this, lines[0]);
    m_nodes.push_back(title_node);
  }

  //////////////////////////////////////////////////////////////////////////////

  void Ast::calculateCommitScore()
  {
    double score = 0.0;
    for (auto node : m_nodes)
    {
      score += node->getScore();
    }
    m_score = std::min(std::max(0.0, score/m_nodes.size()), 5.0);
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<MessageNode*> & Ast::getNodes()
  {
    return m_nodes;
  }

  //////////////////////////////////////////////////////////////////////////////

  double Ast::getCommitScore()
  {
    return m_score;
  }

  //////////////////////////////////////////////////////////////////////////////

  void Ast::addSuggestion(unsigned line_number, const std::string & suggestion)
  {
    m_suggestions.push_back(std::make_pair(line_number, suggestion));
  }

  //////////////////////////////////////////////////////////////////////////////

  Ast::~Ast()
  {
    for (auto node : m_nodes)
    {
      delete node;
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  MessageNode::MessageNode(Ast *owner)
  : m_owner(owner)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  void MessageNode::addSuggestion(
    unsigned line_number, const std::string & suggestion
  ) const
  {
    if (m_owner)
      m_owner->addSuggestion(line_number, suggestion);
  }

  //////////////////////////////////////////////////////////////////////////////

  TitleNode::TitleNode(Ast *owner, const std::string &title)
  : MessageNode(owner), m_title(title)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & TitleNode::getData()
  {
    return m_title;
  }

  //////////////////////////////////////////////////////////////////////////////

  double TitleNode::getScore() const
  {
    if (m_title.length() < 1)
      return 0.0;

    double score = 0.0;

    if (m_title.length() <= 72)
      score += 1.0;
    else
      addSuggestion(1, "Length of summary is greater than 72 character.");

    if (isupper(m_title[0]))  // OR if begins with a file name
      score += 1.0;
    else
      addSuggestion(1, "Summary should begin with a capital letter or object name.");

    return score;
  }

}