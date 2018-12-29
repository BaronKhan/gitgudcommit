Scoring Theory
===

Checks
---

A commit message is given a score out of 5, and is a average score of all the
rule checks below.

- Title width
- Title and body separation
- Body width
- Use of present tense and not past tense with POS tagging
- Mentions of files/keywords changed or added
- Any bullet points start with a dash followed by a space
- Bullet point width
- Spell check
- Reference to issue or JIRA ID

Note that a keyword can map to multiple files, so when considering if a keyword
is correctly used, make sure several of its files are mentioned (otherwise, just
the single filename should be mentioned). Also note that a keyword can be multiple
words.

Algorithm
---

TBD

Testing
---

Use test cases from xkcd comic image in README.md to verify correctness using
thresholds.