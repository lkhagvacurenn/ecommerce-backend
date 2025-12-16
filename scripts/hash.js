const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("sysadminYmaa", 10);
  console.log("HASH:", hash);
})();
