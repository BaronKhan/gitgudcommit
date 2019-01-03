#include <cstdlib>
#include <ctime>
#include <algorithm>
#include <sstream>
#include <gtest/gtest.h>
#include "gitgudcommit.hpp"
#include "ast.hpp"
#include "tagger.hpp"
#include "spell.hpp"

int main(int argc, char **argv)
{
  if (!GitGud::Tagger::getInstance().initPosTagger(
      "models/brown-simplified.ngrams",
      "models/brown-simplified.lexicon")
    || !GitGud::SpellChecker::getInstance().initSpellChecker(
      "models/english-us.aff",
      "models/english-us.dic")
  )
    return EXIT_FAILURE;
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}

TEST(SplitMessage, Lines)
{
  const std::string test = "A title\n\nShould be 5 lines.\n\n- A bullet point";
  EXPECT_EQ(5, GitGud::Ast::split(test, '\n').size());
}

TEST(ParseMessage, NodeCount)
{
  GitGud::Commit commit("", "",
    "A summary\n\nShould be 6 nodes\nso count them.\n\n- A bullet point", 0);
  EXPECT_EQ(6, commit.getAst()->getNodes().size());
}

TEST(PosTagger, TagsSize)
{
  const std::string test = "A sentence with 5 tags";
  EXPECT_EQ(5, GitGud::Tagger::getInstance().tagSentence(test).size());
}

TEST(PosTagger, VerbPastParticiple)
{
  std::vector<std::string> tests { "Added", "Updated", "Created" };
  for (auto &test : tests)
  {
    std::vector<std::string> v = GitGud::Tagger::getInstance().tagSentence(test);
    EXPECT_TRUE(std::find(v.begin(), v.end(), "VBN") != v.end());
  }
}

TEST(PosTagger, VerbPresent)
{
  std::vector<std::string> tests { "Add", "Update", "Create" };
  for (auto &test : tests)
  {
    std::vector<std::string> v = GitGud::Tagger::getInstance().tagSentence(test);
    EXPECT_TRUE(std::find(v.begin(), v.end(), "VB") != v.end());
  }
}

TEST(SpellChecker, Simple)
{
  EXPECT_FALSE(GitGud::SpellChecker::getInstance().spellingError("update"));
  EXPECT_TRUE(GitGud::SpellChecker::getInstance().spellingError("updte"));
}

TEST(SpellChecker, Suggestion)
{
  EXPECT_TRUE(GitGud::SpellChecker::getInstance().spellingSuggestion("misstake").size() >= 1);
  std::vector<std::string> v = GitGud::SpellChecker::getInstance().spellingSuggestion("misstake");
  EXPECT_TRUE(v[0] == "mistake");
}

TEST(SpellChecker, ErrorCount)
{
  GitGud::Commit commit("", "", "added thwee speling misstakes", 0);
  unsigned spelling_error_count = 0;
  for (auto &suggestion : commit.getSuggestions())
  {
    if (suggestion.second.find("spelling error") != std::string::npos)
      spelling_error_count++;
  }
  EXPECT_EQ(3, spelling_error_count);
}

TEST(Summary, Suggestions)
{
  GitGud::Commit commit("", "", "added a bad sumary", 0);
  EXPECT_GE(3, commit.getSuggestions().size());
}

TEST(Scoring, BlankLineSuggestion)
{
  GitGud::Commit commit("", "", "Add new file\nAdd a new config file.", 0);
  for (auto &suggestion : commit.getSuggestions())
  {
    if (suggestion.first == 2 &&
        suggestion.second.find("blank line") != std::string::npos)
      return;
  }
  FAIL();
}

TEST(Processing, Timing)
{
  const clock_t begin_time = clock();
  for (int i=0; i < 2000; i++)
  {
    GitGud::Commit commit("", "", "This is a summary with some words\nThis is the body\n\
      with lots of words in it.\nIt is so long antidisestablishmentarianism\n\
      haaaaaaaaaaaaaaaaaaaaaaaandssss Thanks for your time\n- But let's get straight to the point", 0);
    float time = float(clock() - begin_time) / CLOCKS_PER_SEC;
    if (time > 10.0)
      FAIL() << "Processing of 2000 commits exceeded 7 seconds";
  }
  std::cout << "Processing of 2000 commits took " <<
    float(clock() - begin_time) / CLOCKS_PER_SEC << "s" << std::endl;
}