#ifndef AST_HPP_
#define AST_HPP_

#include <string>
#include <vector>
#include <utility>

namespace GitGud
{
  class MessageNode;

  enum NodeType
  {
    SUMMARY,
    BLANK,
    BODY,
    POINT
  };

  // Stores the internal representation of a commit message as a vector of nodes
  class Ast
  {
  private:
    std::vector<MessageNode*> m_nodes;
    std::vector<std::pair<unsigned, std::string>> m_suggestions;
    std::vector<std::string> m_suggestions_full;
    double m_score;

    void parseMessage(const std::string &message);
    void calculateCommitScore();

  public:
    static void addFilename(const std::string & filename);
    static void resetFilenames();
    static std::vector<std::string> split(const std::string &s, char delim);

    Ast(const std::string &message);

    std::vector<MessageNode*> & getNodes();
    std::vector<std::pair<unsigned, std::string>> & getSuggestions();
    std::vector<std::string> getSuggestionsFull();
    double getCommitScore();
    void addSuggestion(unsigned line_number, const std::string & suggestion);

    ~Ast();
  };

  //////////////////////////////////////////////////////////////////////////////

  class MessageNode
  {
  private:
    Ast * m_owner;

  public:
    MessageNode(Ast *owner);

    virtual const std::string & getData() = 0;
    virtual double getScore() const = 0;
    virtual NodeType getType() const = 0;

    void addSuggestion(unsigned line_number, const std::string & suggestion) const;
    bool wordIsFilename(const std::string & word) const;
    void checkSentence(double & score, const std::string & sentence,
      unsigned line_number, bool limit_words=false) const;

    virtual ~MessageNode() {}
  };

  //////////////////////////////////////////////////////////////////////////////

  class SummaryNode : public MessageNode
  {
  private:
    std::string m_summary;

  public:
    SummaryNode(Ast *owner, const std::string &title);

    virtual const std::string & getData();
    virtual double getScore() const;
    virtual NodeType getType() const;
  };

  //////////////////////////////////////////////////////////////////////////////

  class BlankNode : public MessageNode
  {
  private:
    unsigned m_line_number;
    std::string m_blank;
  public:
    BlankNode(Ast *owner, unsigned line_number);

    virtual const std::string & getData();
    virtual double getScore() const;
    virtual NodeType getType() const;
  };

  //////////////////////////////////////////////////////////////////////////////

  class BodyNode : public MessageNode
  {
  private:
    unsigned m_line_number;
    std::string m_line;

  public:
    BodyNode(Ast *owner, unsigned line_number, const std::string &line);

    virtual const std::string & getData();
    virtual double getScore() const;
    virtual NodeType getType() const;
  };

  //////////////////////////////////////////////////////////////////////////////

  class PointNode : public MessageNode
  {
  private:
    unsigned m_line_number;
    std::string m_point;

  public:
    PointNode(Ast *owner, unsigned line_number, const std::string &point);

    virtual const std::string & getData();
    virtual double getScore() const;
    virtual NodeType getType() const;
  };

}

#endif