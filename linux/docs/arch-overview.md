Architecture Overview
==========

* Using libgit2 library
* Use GPU when training custom model

# Repo Manager
* Handles the repository
* Holds a reference/pointer to the Git repository
* Contains a Commit Manager, Log Manager and Training Manager

## Commit Manager
* Handles the creation/editing of a new commit message
* Acts as a replacement for the `git commit` command
* Accesses the Git message handler and edits it before committing
* Calculates the score of the commit message and notifies user

### Commit
* A Commit instance is a single Git commit
* Contains all the metadata of the commit (message, author, timestamp, etc)

## Log Manager
* Outputs the scores of all commits in the repository
* Retrieves all of the commits sequentially
* Uses Intel TBB, OpenMP or cpp-taskflow to calculate scores in parallel
* Multithreading required due to intensive use of POS-tagger

## Training Manager
* Handles the training of the keyword mapping and saves result to a JSON file
* Able to load a JSON file if it exists (also add JSON file to .gitignore)
* Use `--train` command line flag to train on current repo
* Approximate training time based on number of total commits