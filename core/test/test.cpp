#include <gtest/gtest.h>

#include "gitgudcommit.hpp"
#include "ast.hpp"

int main(int argc, char **argv)
{
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}

TEST(SplitMessage, Lines)
{
  const std::string test = "A title\n\n Should be 5 lines.\n\n- A bullet point";
  ASSERT_EQ(5, GitGud::Ast::split(test, '\n').size());
}