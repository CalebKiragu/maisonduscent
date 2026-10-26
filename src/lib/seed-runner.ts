import path from "node:path";
import { getDb, getDbPath } from "./db";

const dbPath = getDbPath();
getDb();
process.stdout.write(
  `Seeded ${path.relative(process.cwd(), dbPath)} — 50 products, 48 orders, 45 days of traffic.\n`,
);
