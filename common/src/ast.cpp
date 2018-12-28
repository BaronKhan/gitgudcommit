#include "ast.hpp"

namespace GitGud
{

  void Ast::parseMessage(const std::string &message)
  {
  }

  //////////////////////////////////////////////////////////////////////////////

  std::string & HeadNode::getData()
  {
    return m_title;
  }

}