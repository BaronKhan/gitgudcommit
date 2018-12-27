Functional Requirements
========================

- Acts a replacement/wrapper for `git commit`
- Generate a commit message automatically for the user based on their diff
- Get access to commit message handler before commiting and pre-fill message
- Messages are pre-generated based on a template (e.g. pre-pending JIRA ID)
- Before committing, check message score, list suggestions and final score
- Also have a `--log` option to list the scores of each commit in the repo with `less`
