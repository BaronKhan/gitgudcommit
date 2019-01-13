Architecture Overview
==========

* Using libgit2 library
* Use GPU when training custom model

# Repo Manager
* Handles the repository
* Holds a reference/pointer to the Git repository
* Checks if Git is installed in constructor!
* Contains a Log Manager or Training Manager

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