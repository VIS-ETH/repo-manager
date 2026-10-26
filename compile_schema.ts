import { compile } from "json-schema-to-typescript";
import { load } from "js-yaml";
import fs from "fs";

const schema = load(fs.readFileSync("mirror-config-schema.yaml", "utf8"));
const TYPEGEN_DIR = "src/typegen";

const ts = await compile(schema as any, "MirrorConfigFile");

if (!fs.existsSync(TYPEGEN_DIR)) {
  fs.mkdirSync(TYPEGEN_DIR);
}
fs.writeFileSync("src/typegen/types.generated.ts", ts);
