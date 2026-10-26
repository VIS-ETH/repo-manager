import * as fs from "fs";
import * as path from "path";
import { load } from "js-yaml";
import { dirname } from "node:path";
import Ajv, { ValidateFunction } from "ajv";
import type { MirroringConfigNestedGroups } from "./typegen/types.generated.ts";
import { Group, Project } from "./typegen/types.generated.js";
import { fileURLToPath } from "node:url";

const SCHEMA_PATH = path.join(dirname(fileURLToPath(import.meta.url)), "../mirror-config-schema.yaml");
const CONFIG_PATH = path.join(dirname(fileURLToPath(import.meta.url)), "../mirror-config.yaml");

function loadValidator(): ValidateFunction {
  const schemaYaml = fs.readFileSync(SCHEMA_PATH, "utf8");
  const schema = load(schemaYaml);
  const ajv = new Ajv.Ajv({ allErrors: true, strict: true });
  return ajv.compile(schema as object);
}

export function walk(groups: Group[], proceedOnProject: (g: Group, p: Project) => void, prefix = "") {
  for (const group of groups) {
    const currentPath = prefix ? `${prefix}/${group.name}` : group.name;
    const groupWithPath = { ...group, name: currentPath };
    for (const project of group.projects ?? []) {
      proceedOnProject(groupWithPath, project);
    }
    if (group.groups) walk(group.groups, proceedOnProject, currentPath);
  }
}

export function flattenProjects(groups: Group[], prefix = ""): {name_with_namespace: string, project: Project}[] {
  const projects: {name_with_namespace: string, project: Project}[] = [];
  walk(
    groups,
    (group, p) => {
      projects.push({name_with_namespace: `${group.name}/${p.name}`, project: p});
    },
    prefix,
  );
  return projects;
}

export function loadMirrorConfig(): MirroringConfigNestedGroups {
  const configYaml = fs.readFileSync(CONFIG_PATH, "utf8");
  const raw = load(configYaml);

  const validate = loadValidator();
  if (!validate(raw)) {
    const details = (validate.errors ?? [])
      .map((e) => `${e.instancePath || "<root>"} ${e.message}`)
      .join("\n");
    throw new Error(`Invalid mirror config:\n${details}`);
  }

  // Ajv confirmed raw matches the schema shape, so this cast is now safe
  return raw as MirroringConfigNestedGroups;
}
