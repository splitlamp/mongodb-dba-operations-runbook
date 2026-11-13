# Evidence Checklist

Save screenshots in `evidence/` only after removing secrets and personal information. Prefer screenshots of your own terminal output and concise written results. Do not commit backup dumps.

Suggested files:
- `01-server-version.png` — `mongod --version`, `mongosh --version`, `mongodump --version`
- `02-ping-and-collections.png` — successful ping and list of ShopDB collections
- `03-data-validation.png` — expected counts 10 / 10 / 12
- `04-explain-before.png` — executionStats before index
- `05-index-created.png` — `getIndexes()` showing compound index
- `06-explain-after.png` — executionStats after index
- `07-user-read-success.png` — read-only account successfully reads a document
- `08-user-write-denied.png` — read-only account denied insert
- `09-backup-created.png` — dump command success and file listing (no credentials)
- `10-restore-validation.png` — restored counts match source counts
- `11-replica-set-status.png` — one node PRIMARY; explain single-node limitation
- `12-incident-report.png` — a troubleshooting issue documented with root cause and validation

For each image, include a short caption in README: what operation was performed, what result was expected, and what the evidence proves. Do not fake or edit outputs to imply a test passed if it did not.
