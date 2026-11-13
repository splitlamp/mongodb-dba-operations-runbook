// Run with: mongosh "mongodb://127.0.0.1:27017/ShopDB" --file scripts/04_validation_checks.js
const d = db.getSiblingDB("ShopDB");
const expected = { customers: 10, products: 10, orders: 12 };
let passed = true;

for (const [collection, expectedCount] of Object.entries(expected)) {
  const actual = d.getCollection(collection).countDocuments();
  const ok = actual === expectedCount;
  print(`${ok ? "PASS" : "CHECK"} ${collection}: expected=${expectedCount}, actual=${actual}`);
  if (!ok) passed = false;
}
print("\nSample customer:");
printjson(d.customers.findOne({}, { _id: 0 }));
print("\nOrders by status:");
printjson(d.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray());
print("\nValidation status: " + (passed ? "PASS" : "CHECK COUNTS"));
