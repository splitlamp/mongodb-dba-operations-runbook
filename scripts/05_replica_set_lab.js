// Run AFTER enabling replication.replSetName: "rs0" in mongod.cfg and restarting MongoDB.
// Connect with mongosh to localhost and run this script only once per fresh replica-set setup.
try {
  printjson(rs.status());
} catch (e) {
  print("Replica set may not be initialized yet: " + e.message);
  print('Initialize once with: rs.initiate({_id:"rs0", members:[{_id:0,host:"127.0.0.1:27017"}]})');
}
print("\nHello response:");
printjson(db.hello());
print("\nReplica-set config (available after initiation):");
try { printjson(rs.conf()); } catch (e) { print("Not configured yet."); }
