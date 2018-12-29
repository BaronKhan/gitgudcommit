#include <gtest/gtest.h>

#include "gitgudcommit.hpp"
#include "ast.hpp"

#include "citar/corpus/TaggedWord.hh"
#include "citar/tagger/hmm/HMMTagger.hh"
#include "citar/tagger/hmm/LinearInterpolationSmoothing.hh"
#include "citar/tagger/hmm/Model.hh"
#include "citar/tagger/wordhandler/KnownWordHandler.hh"
#include "citar/tagger/wordhandler/SuffixWordHandler.hh"

#include <fstream>

int main(int argc, char **argv)
{
  std::ifstream nGramStream("models/brown-simplified.ngrams");
  if (!nGramStream.good())
  {
    std::cerr << "Could not open ngrams: " << std::endl;
    return 1;
  }

  std::ifstream lexiconStream("models/brown-simplified.lexicon");
  if (!lexiconStream.good())
  {
    std::cerr << "Could not open lexicon: " << std::endl;
    return 1;
  }

  std::shared_ptr<citar::tagger::Model> model(citar::tagger::Model::readModel(lexiconStream, nGramStream));

  citar::tagger::SuffixWordHandler suffixWordHandler(model, 2, 2, 8);

  citar::tagger::KnownWordHandler knownWordHandler(model, &suffixWordHandler);

  citar::tagger::LinearInterpolationSmoothing smoothing(model);

  citar::tagger::HMMTagger hmmTagger(model, &knownWordHandler, &smoothing);

  std::vector<std::string> sentence(2, "<START>");
  sentence.push_back("Added");
  sentence.push_back("file");
  sentence.push_back("<END");
  std::vector<std::string> taggedWords = hmmTagger.tag(sentence);

  for (size_t i = 2; i < sentence.size() - 1; ++i)
    std::cout << sentence[i] << "/" << taggedWords[i] << " ";
  std::cout << std::endl;

  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}

TEST(SplitMessage, Lines)
{
  const std::string test = "A title\n\n Should be 5 lines.\n\n- A bullet point";
  EXPECT_EQ(5, GitGud::Ast::split(test, '\n').size());
}