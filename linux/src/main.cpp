#include <iostream>
#include <fstream>
#include <git2.h>
#include <cstring>

int main(int argc, char *argv[])
{
  if (argc < 2) {
    std::cerr << "usage: gitgudcommit <repository> <output file>" << std::endl;
    exit(1);
  }

  try {
    char *repo_location = argv[1];
    char *output_name = argv[2];

    git_libgit2_init();

    // Check if repo_location is a git repo
    if (git_repository_open_ext(NULL, repo_location,
      GIT_REPOSITORY_OPEN_NO_SEARCH, NULL) != 0)
    {
      throw "directory is not a git repository";
    }

    // Open a repository
    git_repository *repo;
    int error = git_repository_open(&repo, repo_location);

    // Dereference HEAD to a commit
    git_object *head_commit;
    error = git_revparse_single(&head_commit, repo, "HEAD^{commit}");
    git_commit *commit = (git_commit*)head_commit;

    // Print some of the commit's properties
    printf("%s", git_commit_message(commit));
    const git_signature *author = git_commit_author(commit);
    printf("%s <%s>\n", author->name, author->email);
    const git_oid *tree_id = git_commit_tree_id(commit);

    // Cleanup
    git_commit_free(commit);
    git_repository_free(repo);

    git_libgit2_shutdown();

  } catch (char const* &msg) {
    std::cerr << "Caught exception : " << msg << std::endl;
    return 1;
  } catch (std::exception &e) {
    std::cerr << "Caught exception : " << e.what() << std::endl;
    return 1;
  } catch (...) {
    std::cerr << "Caught unknown exception." << std::endl;
    return 1;
  }

  return 0;
}
