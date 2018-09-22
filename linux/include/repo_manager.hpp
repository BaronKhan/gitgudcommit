#ifndef REPO_MANAGER_HPP
#define REPO_MANAGER_HPP

#include "git2.h"

class RepoManager {
  git_commit **commits;
  git_repository *repo;
  char *branch_name;

public:
  bool load_commits();
  bool load_repo();
};

#endif