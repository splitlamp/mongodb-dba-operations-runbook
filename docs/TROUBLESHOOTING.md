# Troubleshooting Runbook

Use this format for every incident: **symptom → checks → root cause → fix → validation → evidence**.

| Symptom | Checks | Common cause | Safe next step |
|---|---|---|---|
| `mongosh` is not recognized | `Get-Command mongosh` | Shell not installed or PATH missing | Install the official shell; update PATH; open a new terminal |
| `mongodump` is not recognized | `Get-Command mongodump` | Database Tools not installed or PATH missing | Install Database Tools and add `bin` folder to PATH |
| `ECONNREFUSED 127.0.0.1:27017` | `Get-Service MongoDB`; inspect MongoDB log | Service stopped, startup failed, or wrong port | Start service; inspect log before changing config |
| Service will not start | `Get-Service MongoDB`; inspect `mongod.cfg` and server log | YAML indentation, invalid path, port conflict, permissions | Back up config; correct one issue at a time |
| Authentication failed | Verify username, password, auth DB, server endpoint | Wrong auth database or credentials | Use `--authenticationDatabase admin` for `labAdmin`; enter password interactively |
| `not authorized` on insert | `db.runCommand({connectionStatus:1})`; inspect `db.getUser()` as admin | Read-only role is working as intended | Use an authorized test account only if the task requires writing |
| Query uses `COLLSCAN` | `explain("executionStats")`, filter, indexes | No useful index, tiny collection, or planner cost choice | Test representative data; add only justified indexes |
| Restore has namespace mismatch | Check dump folder and namespace names | Source/target namespace mapping is wrong | Use `--nsFrom="ShopDB.*" --nsTo="ShopDB_RestoreTest.*"` |
| Replica set not initialized | `db.hello()`, `rs.status()`, config | `rs.initiate()` not run or `replSetName` missing | Verify config, restart, initiate once |
| Replica set member unreachable | `rs.conf()`, port, host resolution | Incorrect host/port or server not listening | Use localhost for this single-machine lab; check port and service |

## Incident report template

```text
Incident ID:
Date/time:
Environment/version:
Symptom:
Impact:
Checks performed:
Root cause:
Fix:
Validation after fix:
Evidence file(s):
Prevention / follow-up:
```

Do not publish passwords, complete credential-bearing URIs, internal IPs, customer records, or unredacted logs.
