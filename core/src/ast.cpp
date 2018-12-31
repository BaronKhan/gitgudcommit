#include <sstream>
#include <algorithm>
#include <cctype>
#include "ast.hpp"
#include "tagger.hpp"

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
    MessageNode* title_node = new SummaryNode(this, lines[0]);
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

    for (int i=0; i<m_suggestions.size(); i++)
    {
      auto suggestion = m_suggestions[i];
      std::stringstream ss;
      ss << "Line " << suggestion.first << ": " << suggestion.second;
      m_suggestions_full.push_back(ss.str());
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<MessageNode*> & Ast::getNodes()
  {
    return m_nodes;
  }


  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::pair<unsigned, std::string>> & Ast::getSuggestions()
  {
    return m_suggestions;
  }

  //////////////////////////////////////////////////////////////////////////////

  std::vector<std::string> Ast::getSuggestionsFull()
  {
    return m_suggestions_full;
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

  SummaryNode::SummaryNode(Ast *owner, const std::string &title)
  : MessageNode(owner), m_summary(title)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & SummaryNode::getData()
  {
    return m_summary;
  }

  //////////////////////////////////////////////////////////////////////////////

  double SummaryNode::getScore() const
  {
    if (m_summary.length() < 1)
      return 0.0;

    double score = 5.0;

    if (m_summary.length() > 72)
    {
      addSuggestion(1, "Length of summary is greater than 72 character.");
      score -= 2.0;
    }

    if (!isupper(m_summary[0]))  // TODO: OR if begins with a file name
    {
      addSuggestion(1, "Summary should begin with a capital letter or filename.");
      score -= 1.0;
    }

    auto words = Tagger::getInstance().sentence2Vec(m_summary);
    auto tags = Tagger::getInstance().tagSentence(words);
    auto tags_size = tags.size();
    for (unsigned i=0; i<tags_size; ++i)
    {
      auto tag = tags[i];
      if (tag.find("VBN") != std::string::npos || tag.find("VBD") != std::string::npos)
      {
        std::stringstream ss;
        ss << "\"" << words[i] << "\" - consider using the present tense form.";
        addSuggestion(1, ss.str());
        score -= 1.0/tags_size;
      }
    }

    return std::max(0.0, score);
  }

}