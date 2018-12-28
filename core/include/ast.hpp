#ifndef AST_HPP_
#define AST_HPP_

#include <string>
#include <vector>

namespace GitGud
{
  
  class MessageNode
  {
  public:
    virtual const std::string & getData() = 0;
    virtual ~MessageNode() {}
  };

  // Stores the internal representation of a commit message as a vector of nodes
  class Ast
  {
  private:
    std::vector<MessageNode*> m_nodes;
  public:
    static std::vector<std::string> split(const std::string &s, char delim);

    void parseMessage(const std::string &message);
  };

  class TitleNode : public MessageNode
  {
  private:
    std::string m_title;

  public:
    TitleNode(const std::string &title);

    virtual const std::string & getData();
  };

}

#endif