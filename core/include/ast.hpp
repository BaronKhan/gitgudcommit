#ifndef AST_HPP_
#define AST_HPP_

#include <string>
#include <vector>
#include <utility>

namespace GitGud
{
  class MessageNode;

  // Stores the internal representation of a commit message as a vector of nodes
  class Ast
  {
  private:
    std::vector<MessageNode*> m_nodes;
    std::vector<std::pair<unsigned, std::string>> m_suggestions;
    double m_score;

    void parseMessage(const std::string &message);
    void calculateCommitScore();

  public:
    static std::vector<std::string> split(const std::string &s, char delim);

    Ast(const std::string &message);

    std::vector<MessageNode*> & getNodes();
    double getCommitScore();
    void addSuggestion(unsigned line_number, const std::string & suggestion);

    ~Ast();
  };

  class MessageNode
  {
  private:
    Ast * m_owner;

  public:
    MessageNode(Ast *owner);

    virtual const std::string & getData() = 0;
    virtual double getScore() const = 0;

    void addSuggestion(unsigned line_number, const std::string & suggestion) const;

    virtual ~MessageNode() {}
  };

  class SummaryNode : public MessageNode
  {
  private:
    std::string m_summary;

  public:
    SummaryNode(Ast *owner, const std::string &title);

    virtual const std::string & getData();
    virtual double getScore() const;
  };

}

#endif