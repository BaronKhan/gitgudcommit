#ifndef AST_HPP_
#define AST_HPP_

#include <string>
#include <vector>

namespace GitGud
{
  
  class MessageNode
  {
  public:
    virtual std::string getData() const = 0;
    virtual ~MessageNode() {}
  };

  // Stores the internal representation of a commit message as a vector of nodes
  class Ast
  {
  private:
    std::vector<MessageNode*> m_nodes;
  public:
    void parseMessage(const std::string &message);
  };

  class HeadNode : public MessageNode
  {
  private:
    std::string m_title;

  public:
    HeadNode(const std::string &title);

    virtual std::string & getData();
  };

}

#endif