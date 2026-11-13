# MongoDB DBA Operations Runbook — ShopDB

A beginner-friendly, reproducible MongoDB administration portfolio project for a local Windows lab. It covers installation, sample-data loading, CRUD, index/query-plan analysis, least-privilege users, backup/restore, replica-set health checks, troubleshooting, and GitHub evidence.

> **Lab safety:** This is a local learning environment, not production. Keep MongoDB bound to localhost. Never expose port 27017 to the internet. Use only fictional data. Never commit passwords, connection strings containing credentials, or database dumps.

## Outcomes

By completing the runbook, you should be able to:

- Install MongoDB Community Server, `mongosh`, and MongoDB Database Tools.  
- Load and validate the ShopDB sample dataset.  
- Explain a query plan and compare a query before/after adding an index.  
- Create a least-privilege application user and verify authentication.  
- Back up a database with `mongodump`, restore it to a separate database, and validate counts.  
- Configure a local single-node replica set for development, inspect status, and understand its limitations.  
- Write evidence-backed incident notes and publish safe, repeatable steps on GitHub.

## Repository map

```
mongodb-dba-operations-runbook/
├── README.md
├── data/
│   ├── customers.json
│   ├── products.json
│   └── orders.json
├── scripts/
│   ├── 01_setup_shopdb.js
│   ├── 02_index_lab.js
│   ├── 03_create_users.js
│   ├── 04_validation_checks.js
│   └── 05_replica_set_lab.js
├── docs/
│   ├── BACKUP_RESTORE.md
│   ├── REPLICA_SET.md
│   ├── TROUBLESHOOTING.md
│   └── EVIDENCE_CHECKLIST.md
├── evidence/
│   └── .gitkeep
└── .gitignore
```

## 0\. Prerequisites

- Windows 10/11 64-bit.  
- A Windows account with permission to install applications.  
- PowerShell or Windows Terminal.  
- Git and a GitHub account (for publishing).  
- Suggested free disk space: 5 GB or more for the server, test data, backups, and replica-set files.

Use the official MongoDB documentation and download pages linked below. Select a currently supported Community Server release for Windows x64. Install `mongosh` and Database Tools separately if the installer does not include them; MongoDB's docs explicitly note that `mongosh` is a separate install.

Official references:

- Server on Windows: [https\://www\.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)  
- `mongosh` install: [https\://www\.mongodb.com/docs/mongodb-shell/install/](https://www.mongodb.com/docs/mongodb-shell/install/)  
- Database Tools install: [https\://www\.mongodb.com/docs/database-tools/installation/](https://www.mongodb.com/docs/database-tools/installation/)  
- `mongodump`: [https\://www\.mongodb.com/docs/database-tools/mongodump/](https://www.mongodb.com/docs/database-tools/mongodump/)  
- `mongorestore`: [https\://www\.mongodb.com/docs/database-tools/mongorestore/](https://www.mongodb.com/docs/database-tools/mongorestore/)  
- Test/dev replica set: [Deploy a Self-Managed Replica Set for Testing and Development \- Database Manual \- MongoDB Docs](https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set-for-testing/)  
- Security checklist: [https\://www\.mongodb.com/docs/manual/administration/security-checklist/](https://www.mongodb.com/docs/manual/administration/security-checklist/)

## 1\. Install MongoDB on Windows

### 1.1 Install Community Server

1. Open the official Windows installation guide above and follow its Download Center link.  
2. Select a supported MongoDB Community Server version, Windows x64, and MSI package.  
3. Run the MSI installer.  
4. Choose the Complete setup unless you have a reason to customize.  
5. If prompted, install MongoDB as a Windows Service. Record the service name and config-file path shown by the installer.  
6. Install Compass if you want a visual interface; it is optional.  
7. Finish installation.

### 1.2 Verify the server/service

Open **PowerShell** (not `mongosh`) and run:

```
Get-Service MongoDB
```

If the service exists but is stopped:

```
Start-Service MongoDB
```

If your installation used a different service name, use the exact name shown by `Get-Service`.

Check the server binary (the path may vary by installed version):

```
mongod --version
```

If `mongod` is not recognized, find the MongoDB Server `bin` folder (commonly under `C:\Program Files\MongoDB\Server\<version>\bin`) and add that folder to your Windows PATH, then close and reopen the terminal.

### 1.3 Install MongoDB Shell (`mongosh`)

Download the Windows 64-bit MSI from [https\://www\.mongodb.com/docs/mongodb-shell/install/](https://www.mongodb.com/docs/mongodb-shell/install/) and install it. Then open a **new** PowerShell window:

```
mongosh --version
mongosh
```

A successful local connection normally connects to `mongodb://127.0.0.1:27017`. In the shell, run:

```js
db.runCommand({ ping: 1 })
db.version()
show dbs
```

Expected: `ok: 1` for ping and a server version. Exit with `exit`.

### 1.4 Install MongoDB Database Tools

Download the Windows x64 Database Tools MSI or ZIP from [https\://www\.mongodb.com/docs/database-tools/installation/](https://www.mongodb.com/docs/database-tools/installation/). For ZIP installation, extract it, locate its `bin` directory, and add that directory to PATH. Reopen PowerShell and verify:

```
mongodump --version
mongorestore --version
mongoimport --version
```

If these commands are not recognized, check PATH and open a new terminal.

### 1.5 Create a workspace

In PowerShell:

```
New-Item -ItemType Directory -Force "$HOME\mongodb-dba-lab\backups" | Out-Null
New-Item -ItemType Directory -Force "$HOME\mongodb-dba-lab\logs" | Out-Null
```

Keep this working area separate from the GitHub repository. Database dumps and logs may contain sensitive information in real environments.

## 2\. Load the ShopDB sample data

### 2.1 Copy the repository

Download/clone this repository, then in PowerShell change directory to its root. Example:

```
cd "$HOME\Downloads\mongodb-dba-operations-runbook-starter\mongodb-dba-operations-runbook"
```

Adjust the path to where you saved the project.

### 2.2 Import each JSON array

The files in `data/` are fictional sample records encoded as JSON arrays. Run from the repository root:

```
1. mongoimport --uri "mongodb://127.0.0.1:27017" --db ShopDB --collection customers --file "C:\Users\Aditya paliwal\Downloads\mongodb-dba-operations-runbook-starter\mongodb-dba-operations-runbook\data\customers.json" --jsonArray
2.mongoimport --uri "mongodb://127.0.0.1:27017" --db ShopDB --collection products --file "C:\Users\Aditya paliwal\Downloads\mongodb-dba-operations-runbook-starter\mongodb-dba-operations-runbook\data\products.json" --jsonArray
3.mongoimport --uri "mongodb://127.0.0.1:27017" --db ShopDB --collection orders --file "C:\Users\Aditya paliwal\Downloads\mongodb-dba-operations-runbook-starter\mongodb-dba-operations-runbook\data\orders.json" --jsonArray
```

If you run imports more than once, you may get duplicate records because MongoDB creates new `_id` values on each import. For a clean reset, use `mongosh` and run:

```js
use ShopDB
db.customers.drop()
db.products.drop()
db.orders.drop()
```

Then repeat the three imports. Only drop these collections in this learning database.

### 2.3 Verify counts

Run:

```
mongosh "mongodb://127.0.0.1:27017/ShopDB" --file "C:\Users\Aditya paliwal\Downloads\mongodb-dba-operations-runbook-starter\mongodb-dba-operations-runbook\scripts\04_validation_checks.js"
```

Expected initial counts: customers 10, products 10, orders 12\. The script also prints a few example documents and basic data checks.

## 3\. CRUD and basic DBA checks

Open `mongosh "mongodb://127.0.0.1:27017/ShopDB"` and practise:

```js
show collections
db.customers.findOne()
db.products.find({ active: true }).limit(5)
db.orders.find({ status: "delivered" }).count()
db.customers.find({ city: "Agra" }, { _id: 0, customer_id: 1, name: 1, city: 1 })
```

Insert one temporary test record:

```js
db.customers.insertOne({
  customer_id: "C_TEST",
  name: "Test Customer",
  email: "test.customer@example.test",
  city: "Test City",
  tier: "bronze",
  joined_at: new Date()
})
db.customers.findOne({ customer_id: "C_TEST" })
db.customers.deleteOne({ customer_id: "C_TEST" })
```

Expected: insert reports `acknowledged: true`, find returns the document, delete reports `deletedCount: 1`. Do not use `deleteMany({})` or broad update/delete commands without a filter.

## 4\. Indexes and query plans

Run the script:

```
mongosh "mongodb://127.0.0.1:27017/ShopDB" --file .\scripts\02_index_lab.js
```

The script:

1. Drops only the lab index `city_1_tier_1` if it exists.  
2. Runs a filter on city and tier and prints `explain("executionStats")`.  
3. Creates a compound index `{ city: 1, tier: 1 }`.  
4. Runs the same query again and prints the execution plan.  
5. Lists indexes.

Learn to inspect:

- `winningPlan` / stage: look for `COLLSCAN` (collection scan) versus `IXSCAN` (index scan).  
- `nReturned`: how many documents matched.  
- `totalDocsExamined`: documents examined.  
- `totalKeysExamined`: index keys examined.

**Important:** ShopDB is deliberately small, so a query planner may still choose a collection scan for some predicates. To make comparisons meaningful, increase the dataset size (for example, generate 50,000+ fictional documents) and test again. Never claim that an index improved performance unless your actual execution statistics support the claim. Indexes speed some reads but consume storage and add write overhead.

Additional practice:

```js
db.orders.createIndex({ customer_id: 1, ordered_at: -1 })
db.orders.find({ customer_id: "C1001" }).sort({ ordered_at: -1 }).explain("executionStats")
db.products.getIndexes()
```

## 5\. Users and least privilegecl

Start with the default local lab (no authentication) and create the administrator user first. Then enable authentication in the server config. Exact config location depends on installation; commonly it is the `mongod.cfg` file under the MongoDB Server installation directory.

### 5.1 Create an administrator user

Connect locally:

```
mongosh
```

Run:

```js
use admin
db.createUser({
  user: "labAdmin",
  pwd: passwordPrompt(),
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }, { role: "readWriteAnyDatabase", db: "admin" }, { role: "dbAdminAnyDatabase", db: "admin" }, { role: "clusterAdmin", db: "admin" }]
})
```

Enter a unique lab password when prompted. This broad lab administrator is for managing the test environment only; do not reuse this role design as a production recommendation without a formal privilege review.

### 5.2 Enable authorization

1. Exit `mongosh`.  
2. Open the `mongod.cfg` file as Administrator.  
3. Add or merge the following YAML section, preserving the existing `storage`, `systemLog`, and `net` sections:

```
security:
  authorization: enabled
```

YAML indentation matters: use spaces, not tabs. If the config already has a `security:` section, add `authorization: enabled` under it rather than creating a duplicate. 4\. Restart the MongoDB Windows service from an elevated PowerShell window:

```
Restart-Service MongoDB
```

If the service name differs, use the name you recorded earlier.

5. Test unauthenticated access:

```
mongosh
```

Some basic connection metadata may still be available, but database reads/writes requiring authorization should fail. Authenticate as admin:

```
mongosh --username labAdmin --authenticationDatabase admin --password
```

Enter the password at the prompt. Do not place passwords directly in terminal commands or screenshots.

### 5.3 Create a custom database role for an application user with limited permissions

In the authenticated admin shell:

```js
use ShopDB

db.createRole(
   {
     role: "salesAnalytics",
     privileges: [
       { resource: { db: "ShopDB", collection: "customers" }, actions: [ "find" ] },
       { resource: { db: "ShopDB", collection: "orders" }, actions: [ "find" ] }
     ],
     roles: []
    }
)

Here, we create a database user and assign it to the salesAnalytics role. 


use admin
db.createUser(
  {
    user: "salesAnalyticsUser",
    pwd:  passwordPrompt(),
    roles: [ { role: "salesAnalytics", db: "ShopDB" } ]
  }
)
then exit


```

Test with a separate terminal:

```
mongosh --host 127.0.0.1 --port 27017 --username salesAnalyticsUser --password --authenticationDatabase admin ShopDB
```

Enter the password when prompted.

Expected:

- `db.customers.findOne()` succeeds.  
- `db.customers.insertOne({ ... })` fails with an authorization error.  
- Admin can manage users; the read-only application account cannot write.

For a write-capable app account, use `readWrite` on only `ShopDB`, not `readWriteAnyDatabase`. Avoid granting administrative roles to application accounts.

> **Authentication note:** MongoDB's localhost exception allows creating the first user in the admin database when no users/roles exist. Create the first admin before enabling authorization, as shown. If you already have users or have enabled authorization, follow the official user-administration docs rather than trying to bypass access control.

## 6\. Backup and restore

Full procedure: [`docs/BACKUP_RESTORE.md`](http://docs/BACKUP_RESTORE.md).

High-level sequence:

1. Create a backup folder outside the Git repository.  
2. Run `mongodump` for ShopDB.  
3. Confirm dump files exist.  
4. Restore to a different database name (`ShopDB_RestoreTest`) using `mongorestore --nsFrom` and `--nsTo`.  
5. Compare document counts and validate a sample query.  
6. Record the command, date/time, result, and evidence.  
7. Clean up the test restore database only after collecting evidence.

Do not commit backup folders to GitHub.

## 7\. Replica-set health checks

Full procedure: [`docs/REPLICA_SET.md`](http://docs/REPLICA_SET.md).

Use a **single-node replica set** for a beginner laptop lab. It teaches replica-set commands and enables change-stream/transaction features that require replica-set topology, but it does **not** provide high availability or meaningful redundancy. A real three-member replica set needs three separate, mutually reachable members and proper authentication/network security.

Important: do this only after completing the standalone exercises and backup/restore. The procedure requires changing `replication.replSetName` in the config and restarting MongoDB. Back up your config file first. Initiate the set once, then inspect `rs.status()`, `rs.conf()`, `db.hello()`, and `rs.printReplicationInfo()`. 

## 8\. Troubleshooting

Use [`docs/TROUBLESHOOTING.md`](http://docs/TROUBLESHOOTING.md). Common issues include:

- `mongosh` or `mongodump` not recognized: PATH not set or terminal not reopened.  
- `ECONNREFUSED 127.0.0.1:27017`: service is stopped, port differs, or server failed to start.  
- `Authentication failed`: wrong username/authentication database/password, or authorization config not applied.  
- `not authorized`: expected for a least-privilege user trying an operation outside its role.  
- YAML parse/service startup failure: config indentation/duplicate key; inspect the MongoDB log before changing more settings.  
- Replica set not initialized or `RSGhost`: check `replSetName`, server restart, and `rs.initiate()` status.  
- Restore appears empty: confirm namespace mapping and target database/collection names.

## 9\. Evidence and GitHub

Follow [`docs/EVIDENCE_CHECKLIST.md`](http://docs/EVIDENCE_CHECKLIST.md). Capture screenshots from your own terminal/Compass, including:

- `db.runCommand({ ping: 1 })` and `db.version()`  
- collection counts  
- before/after explain plans  
- index list  
- read-only user allowed read and denied write  
- backup file listing and successful restore counts  
- replica-set status  
- a troubleshooting incident with root cause and resolution

Use fictional records only. Blur or remove usernames from your Windows home path if desired. Never show passwords, tokens, private connection strings, or production data.

## 10\. Git commands

From the repository root:

```
git init
git add README.md .gitignore data scripts docs evidence
git status
git commit -m "Add MongoDB DBA operations runbook and lab data"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mongodb-dba-operations-runbook.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username and create an empty repository on GitHub first. If Git asks you to authenticate, use GitHub's supported authentication flow; do not place a token in the remote URL.

## 

## 

## Resume bullet (only after completing the project)

"Built a reproducible MongoDB DBA lab covering query-plan analysis and indexing, least-privilege user management, database backup/restore validation, and replica-set health checks; documented operational procedures, troubleshooting steps, and test evidence in GitHub."

Adjust this bullet to reflect only the tasks you personally completed and verified.