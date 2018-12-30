#include <cstdlib>
#include <gtest/gtest.h>
#include "gitgudcommit.hpp"
#include "ast.hpp"
#include "tagger.hpp"

int main(int argc, char **argv)
{
  if (!GitGud::Tagger::getInstance().initPosTagger(
    "models/brown-simplified.ngrams",
    "models/brown-simplified.lexicon"
  ))
    return EXIT_FAILURE;
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}

TEST(SplitMessage, Lines)
{
  const std::string test = "A title\n\n Should be 5 lines.\n\n- A bullet point";
  EXPECT_EQ(5, GitGud::Ast::split(test, '\n').size());
}

TEST(PosTagger, TagsSize)
{
  const std::string test = "A sentence with 5 tags";
  EXPECT_EQ(5, GitGud::Tagger::getInstance().tagSentence(test).size());
}