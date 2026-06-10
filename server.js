import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const compiled = path.join(root, "dist-server", "server.js");

if (!fs.existsSync(compiled)) {
  console.error(
    "ERROR: dist-server/server.js yoxdur. Əvvəl işlədin: npm run build"
  );
  process.exit(1);
}

await import("./dist-server/server.js");
