// Run only after connecting as an admin user with user-management privileges.
// This script is intentionally a template: enter passwords interactively with passwordPrompt().
const admin = db.getSiblingDB("admin");
const shop = db.getSiblingDB("ShopDB");

// Create first admin manually using the commands in README before enabling auth.
// Then connect as admin and run this file to create a read-only app user.
try {
  shop.createUser({
    user: "shopReader",
    pwd: passwordPrompt(),
    roles: [{ role: "read", db: "ShopDB" }]
  });
  print("Created read-only user shopReader on ShopDB.");
} catch (e) {
  print("User creation did not complete: " + e.message);
  print("If the user already exists, inspect it with: db.getUser('shopReader')");
}
