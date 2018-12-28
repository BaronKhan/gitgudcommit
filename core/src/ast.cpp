#include <sstream>

#include "ast.hpp"

namespace GitGud
{

  void Ast::parseMessage(const std::string &message)
  {
    std::vector<std::string> lines = Ast::split(message, '\n');
    MessageNode* title_node = new TitleNode(lines[0]);
    m_nodes.push_back(title_node);
  }

  //////////////////////////////////////////////////////////////////////////////

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

  TitleNode::TitleNode(const std::string &title)
  : m_title(title)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  const std::string & TitleNode::getData()
  {
    return m_title;
  }

}