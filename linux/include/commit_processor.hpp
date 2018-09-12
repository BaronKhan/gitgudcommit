#ifndef COMMIT_PROCESSOR_HPP
#define COMMIT_PROCESSOR_HPP

#include "git2.h"

class commit_processor {
  git_commit **commits;
  git_repository *repo;
  char *branch_name;

public:
  bool load_commits();
  bool load_repo();
};

#endif