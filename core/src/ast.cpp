#include <sstream>
#include <algorithm>
#include <cctype>
#include "ast.hpp"
#include "tagger.hpp"
#include "spell.hpp"

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
    if (lines.size() > 1) {
      for (unsigned i=1; i<lines.size(); i++)
      {
        MessageNode *new_node;
        auto line = lines[i];
        unsigned line_number = i+1;
        if (line.compare("") == 0)
          new_node = new BlankNode(this, line_number);
        else if (std::find(line.begin(), line.end(), '-') != line.end()) //TODO: ignore hyphens in words
          new_node = new PointNode(this, line_number, line);
        else
          new_node = new BodyNode(this, line_number, line);
        m_nodes.push_back(new_node);
      }
    }
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

    // TODO: adjust score based on ratio of lines changed to message lines

    if (m_nodes.size() > 1 && m_nodes[1]->getType() != NodeType::BLANK) {
      m_score = std::max(0.0, m_score-0.1);
      addSuggestion(2, "Separate the summary and the message body with a blank line.");
    }

    for (unsigned i=0; i<m_suggestions.size(); i++)
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

  inline void MessageNode::addSuggestion(
    unsigned line_number, const std::string & suggestion
  ) const
  {
    if (m_owner)
      m_owner->addSuggestion(line_number, suggestion);
  }

  void MessageNode::checkSentence(double & score, const std::string & sentence,
    unsigned line_number, bool limit_words) const
  {
    auto words = Tagger::getInstance().sentence2Vec(sentence);
    auto tags = Tagger::getInstance().tagWords(words);
    auto words_size = std::min(words.size(), static_cast<size_t>(12));
    auto tags_size = std::min(tags.size(), static_cast<size_t>(12));

    for (unsigned i=0; i<words_size; ++i)
    {
      auto word = words[i];
      unsigned word_length = word.length();
      if (!limit_words || (word_length > 3 && word_length < 9)) {
        if (SpellChecker::getInstance().spellingError(word)) {
          std::stringstream ss;
          std::vector<std::string> spelling_suggestions = SpellChecker::getInstance().
              spellingSuggestion(word);
          if (spelling_suggestions.size() > 0)
          {
            if (word != spelling_suggestions[0])
            {
              ss << "\"" << words[i] << "\" - possible spelling error. Did you mean \"" <<
                 spelling_suggestions[0] << "\"?";
              addSuggestion(line_number, ss.str());
              score -= 1.0/words_size;
            }
          }
          else
          {
            ss << "\"" << words[i] << "\" - possible spelling error.";
            addSuggestion(line_number, ss.str());
            score -= 1.0/words_size;
          }
        }
      }

      auto tag = tags[i];
      if (tag.find("VBN") != std::string::npos || tag.find("VBD") != std::string::npos)
      {
        if (i > 0 && tags[i-1].find("BE") != std::string::npos)
          continue;
        std::stringstream ss;
        ss << "\"" << words[i] << "\" - consider using the present tense form.";
        addSuggestion(line_number, ss.str());
        score -= 1.0/tags_size;
      }
    }
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
    if (m_summary.length() < 2) {
      addSuggestion(1, "Summary is too short.");
      return 0.0;
    }

    double score = 5.0;

    if (m_summary.length() > 50)
    {
      addSuggestion(1, "Length of summary is greater than 50 characters.");
      score -= 1.9 + (0.1 * (m_summary.length() - 50));
    }

    if (!(isupper(m_summary[0]) || m_summary[0] == '['))  // TODO: OR if begins with a file name
    {
      addSuggestion(1, "Summary should begin with a capital letter or filename.");
      score -= 1.0;
    }

    checkSentence(score, m_summary, 1);

    return std::max(0.0, score);
  }

  //////////////////////////////////////////////////////////////////////////////

  NodeType SummaryNode::getType() const
  {
    return NodeType::SUMMARY;
  }

  //////////////////////////////////////////////////////////////////////////////

  BlankNode::BlankNode(Ast *owner, unsigned line_number)
  : MessageNode(owner), m_line_number(line_number), m_blank("")
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & BlankNode::getData()
  {
    return m_blank;
  }

  //////////////////////////////////////////////////////////////////////////////

  double BlankNode::getScore() const
  {
    return 5.0;
  }

  //////////////////////////////////////////////////////////////////////////////

  NodeType BlankNode::getType() const
  {
    return NodeType::BLANK;
  }

  //////////////////////////////////////////////////////////////////////////////

  BodyNode::BodyNode(Ast *owner, unsigned line_number, const std::string &line)
  : MessageNode(owner), m_line_number(line_number), m_line(line)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & BodyNode::getData()
  {
    return m_line;
  }

  //////////////////////////////////////////////////////////////////////////////

  double BodyNode::getScore() const
  {
    double score = 5.0;

    if (m_line.length() > 72)
    {
      addSuggestion(m_line_number, "Length of line is greater than 72 characters.");
      score -= 0.1 * (m_line.length() - 72);
    }

    checkSentence(score, m_line, m_line_number, true);

    return std::max(0.0, score);
  }

  //////////////////////////////////////////////////////////////////////////////

  NodeType BodyNode::getType() const
  {
    return NodeType::POINT;
  }

  //////////////////////////////////////////////////////////////////////////////

  PointNode::PointNode(Ast *owner, unsigned line_number, const std::string &point)
  : MessageNode(owner), m_line_number(line_number), m_point(point)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & PointNode::getData()
  {
    return m_point;
  }

  //////////////////////////////////////////////////////////////////////////////

  double PointNode::getScore() const
  {
    double score = 5.0;

    if (m_point.length() > 72)
    {
      addSuggestion(m_line_number, "Length of bullet point is greater than 72 characters.");
      score -= 0.1 * (m_point.length() - 72);
    }

    checkSentence(score, m_point, m_line_number, true);

    return std::max(0.0, score);
  }

  //////////////////////////////////////////////////////////////////////////////

  NodeType PointNode::getType() const
  {
    return NodeType::POINT;
  }

}