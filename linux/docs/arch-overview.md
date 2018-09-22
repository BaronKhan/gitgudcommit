Architecture Overview
==========

* Using libgit2 library
* Use GPU when training custom model

# Repo Manager
* Handles the repository

## Training Manager
* Handles the training of models on the repo to generate messages
* Use `--train` command line flag to train on current repo
* Approximate training time based on number of total commits
* If no models trained, use default, general models

## Commit Manager
* Handles the creation of the new commit message
* Accesses the Git message handler and edits it before committing