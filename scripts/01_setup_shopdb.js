// Run with: mongosh "mongodb://127.0.0.1:27017/ShopDB" --file scripts/01_setup_shopdb.js
// Idempotent schema/index setup; data is imported separately with mongoimport.
const d = db.getSiblingDB("ShopDB");
print("Database: " + d.getName());
for (const c of ["customers", "products", "orders"]) {
  print(c + " count = " + d.getCollection(c).countDocuments());
}
print("Collections: " + JSON.stringify(d.getCollectionNames()));
