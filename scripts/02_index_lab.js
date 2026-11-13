// Run with: mongosh "mongodb://127.0.0.1:27017/ShopDB" --file scripts/02_index_lab.js
const d = db.getSiblingDB("ShopDB");
const filter = { city: "Agra", tier: "silver" };

print("\n=== BEFORE INDEX ===");
printjson(d.customers.find(filter).explain("executionStats"));

print("\n=== CREATE COMPOUND INDEX ===");
try { d.customers.dropIndex("city_1_tier_1"); } catch (e) { print("Index not present yet."); }
printjson(d.customers.createIndex({ city: 1, tier: 1 }));

print("\n=== AFTER INDEX ===");
printjson(d.customers.find(filter).explain("executionStats"));

print("\n=== CURRENT INDEXES ===");
printjson(d.customers.getIndexes());
