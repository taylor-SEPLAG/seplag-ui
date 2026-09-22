#!/usr/bin/env node
/* eslint-disable no-console */
import { promises as fs } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
// When installed from dist/, templates are at ../template (dist/template).
// When running from source (src/_generator/), templates are at ../template (src/template).
//const TEMPLATE_DIR = join(ROOT, "src", "template");
const TEMPLATE_DIR = join(__dirname, "..", "template");

function pascalCase(s) {
  return s
    .replace(/[-_ ]+/g, " ")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
function camelCase(s) {
  const p = pascalCase(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}
function kebabCase(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}
function constantCase(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toUpperCase();
}

function render(template, ctx) {
  return template.replace(/{{\s*([a-zA-Z0-9]+)\s+([a-zA-Z0-9]+)\s*}}/g, (_, helper, key) => {
    const val = ctx[key] ?? "";
    switch (helper) {
      case "pascalCase":
        return pascalCase(val);
      case "camelCase":
        return camelCase(val);
      case "kebabCase":
        return kebabCase(val);
      case "constantCase":
        return constantCase(val);
      case "lowerCase":
        return String(val).toLowerCase();
      default:
        return "";
    }
  }).replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => ctx[key] ?? "");
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function mapTargetPath(templatePath, outCtx) {
  const rel = relative(TEMPLATE_DIR, templatePath).replace(/\\/g, "/");

  // feat templates -> src/features/{camel}/<file>
  if (rel.startsWith("feat/")) {
    const base = rel.split("/").pop();
    // map known filenames
    if (base.startsWith("BuscarPorId")) return join(ROOT, "src", "features", outCtx.camel, `buscar${outCtx.pascal}PorId.ts`).replace(/\\/g, "/");
    if (base.startsWith("Buscar")) return join(ROOT, "src", "features", outCtx.camel, `buscar${outCtx.pascal}.ts`).replace(/\\/g, "/");
    if (base.startsWith("CreateSlice")) return join(ROOT, "src", "features", outCtx.camel, `create${outCtx.pascal}Slice.ts`).replace(/\\/g, "/");
    if (base.startsWith("UpdateSlice")) return join(ROOT, "src", "features", outCtx.camel, `update${outCtx.pascal}Slice.ts`).replace(/\\/g, "/");
    if (base.startsWith("DeleteSlice")) return join(ROOT, "src", "features", outCtx.camel, `delete${outCtx.pascal}Slice.ts`).replace(/\\/g, "/");
    if (base.startsWith("ListAll")) return join(ROOT, "src", "features", outCtx.camel, `listAll${outCtx.pascal}.ts`).replace(/\\/g, "/");
    if (base.startsWith("CreateSlice")) return join(ROOT, "src", "features", outCtx.camel, `create${outCtx.pascal}Slice.ts`).replace(/\\/g, "/");
    // default
    return join(ROOT, "src", "features", outCtx.camel, base.replace(/\.hbs$/, "")).replace(/\\/g, "/");
  }

  // Root templates (pages and types)
  const name = outCtx.pascal;
  if (rel === "Container.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, "components", `${name}Container.tsx`).replace(/\\/g, "/");
  if (rel === "Form.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, "components", `${name}Form.tsx`).replace(/\\/g, "/");
  if (rel === "Filter.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, "components", `List${name}Filter.tsx`).replace(/\\/g, "/");
  if (rel === "Table.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, "components", `List${name}Table.tsx`).replace(/\\/g, "/");
  if (rel === "List.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, `List${name}.tsx`).replace(/\\/g, "/");
  if (rel === "Create.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, `Create${name}.tsx`).replace(/\\/g, "/");
  if (rel === "Edit.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, `Edit${name}.tsx`).replace(/\\/g, "/");
  if (rel === "View.tsx.hbs") return join(ROOT, "src", "pages", "Cadastro", name, `View${name}.tsx`).replace(/\\/g, "/");
  if (rel === "Request.ts.hbs") return join(ROOT, "src", "pages", "Cadastro", name, `${name}Request.ts`).replace(/\\/g, "/");
  if (rel === "Response.ts.hbs") return join(ROOT, "src", "pages", "Cadastro", name, `${name}Response.ts`).replace(/\\/g, "/");
  if (rel === "PageRoutes.ts.hbs") return join(ROOT, "src", "config", "pageRoutes", `pageRoutes${name}.ts`).replace(/\\/g, "/");

  // fallback: place in root of package (unlikely)
  return join(ROOT, rel.replace(/\.hbs$/, "")).replace(/\\/g, "/");
}

async function ensureDirFor(filePath) {
  const dir = filePath.replace(/\\/g, "/").split("/").slice(0, -1).join("/");
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const force = rawArgs.includes("--force") || rawArgs.includes("-f");
  const args = rawArgs.filter((a) => a !== "--force" && a !== "-f");

  if (args.length === 0) {
    console.error("Usage: node _generator/generate.js NomePascalCase [endpoint] [description] [--force]");
    process.exit(1);
  }

  const rawName = args[0];
  const endpointArg = args[1] || null;
  const description = args[2] || rawName;
  const packageLib ="@seplag/ui-lib-react";
  const packageVersion ="-18";

  const ctx = {
    name: rawName,
    pascal: pascalCase(rawName),
    camel: camelCase(rawName),
    kebab: kebabCase(rawName),
    constant: constantCase(rawName),
    description,
    endpoint: endpointArg,
  };
  
  try {
    const pkgRaw = await fs.readFile(join(ROOT, "package.json"), "utf8");
    const pkg = JSON.parse(pkgRaw);
    const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
    const depMatch = Object.keys(deps).find((k) => k.startsWith(packageLib));
    if (depMatch) {
      ctx.libPackageName = depMatch;
    } else if (typeof pkg.name === "string" && pkg.name.startsWith(packageLib)) {
      ctx.libPackageName = pkg.name;
    } else {
      ctx.libPackageName = packageLib+packageVersion;
    }
  } catch (e) {
    ctx.libPackageName = packageLib+packageVersion;
  }

  // Also create a permissions file under src/config/permissions if not present
  const permPath = join(ROOT, "src", "config", "permissions", `permission${ctx.pascal}.ts`).replace(/\\/g, "/");
  const permTemplate = `import { IDefaultPermissions } from "./permission"

export const Permissions${ctx.pascal} = {
  ${ctx.constant}_VISUALIZAR: "${ctx.constant}_VISUALIZAR",
  ${ctx.constant}_INCLUIR: "${ctx.constant}_INCLUIR",
  ${ctx.constant}_EDITAR: "${ctx.constant}_EDITAR",
  ${ctx.constant}_DELETAR: "${ctx.constant}_DELETAR",
}

export const DefaultPermissions${ctx.pascal}: IDefaultPermissions = {
  nome: "${ctx.constant}",
  visualizar: Permissions${ctx.pascal}.${ctx.constant}_VISUALIZAR,
  incluir: Permissions${ctx.pascal}.${ctx.constant}_INCLUIR,
  editar: Permissions${ctx.pascal}.${ctx.constant}_EDITAR,
  deletar: Permissions${ctx.pascal}.${ctx.constant}_DELETAR,
}`;

  try {
    let permExists = false;
    try {
      await fs.access(permPath);
      permExists = true;
    } catch (e) {
      permExists = false;
    }

    if (!permExists || force) {
      await ensureDirFor(permPath);
      await fs.writeFile(permPath, permTemplate, "utf8");
      console.log(`${permExists ? "  🔁 sobrescrito:" : "  ✅ gerado:"} ${permPath}`);
    }
  } catch (e) {
    // ignore permission file write errors
  }

  // Update LOCAL_STORAGE_KEYS enum with a filter key for this entity
  try {
    const lsPath = join(ROOT, "src", "type", "Enuns", "LocalStorage_enum.ts").replace(/\\/g, "/");
    let lsContent = await fs.readFile(lsPath, "utf8");
    const keyName = `FILTER_TELA_${ctx.constant}`;
    if (!lsContent.includes(keyName)) {
      const insertLine = `  ${keyName}: "filter_tela_${ctx.constant.toLowerCase()}",\n`;
      lsContent = lsContent.replace(/\n}\s*$/, `\n${insertLine}\n}`);
      await fs.writeFile(lsPath, lsContent, "utf8");
      console.log(`  ✅ atualizado: ${lsPath}`);
    }
  } catch (e) {
    // ignore local storage enum update errors
  }

  // read template dir
  try {
    await fs.access(TEMPLATE_DIR);
  } catch (e) {
    console.error(`Template dir not found: ${TEMPLATE_DIR}`);
    process.exit(1);
  }

  const files = (await walk(TEMPLATE_DIR)).filter((f) => f.endsWith(".hbs"));
  if (files.length === 0) {
    console.error("No .hbs templates found in src/template");
    process.exit(1);
  }

  for (const tplPath of files) {
    const tplRaw = await fs.readFile(tplPath, "utf8");
    const rendered = render(tplRaw, {
      name: ctx.name,
      pascalCase: ctx.pascal,
      camelCase: ctx.camel,
      kebabCase: ctx.kebab,
      constantCase: ctx.constant,
      description: ctx.description,
      endpoint: ctx.endpoint || ctx.kebab,
      pascal: ctx.pascal,
      camel: ctx.camel,
      kebab: ctx.kebab,
      constant: ctx.constant,
      libPackageName: ctx.libPackageName,
    });

    const target = mapTargetPath(tplPath, ctx);
    await ensureDirFor(target);
    let exists = false;
    try {
      await fs.access(target);
      exists = true;
    } catch (e) {
      exists = false;
    }

    if (exists && !force) {
      console.log(`  ⚠️  já existe (pulado): ${target}`);
      continue;
    }

    await fs.writeFile(target, rendered, "utf8");
    console.log(`${exists ? "  🔁 sobrescrito:" : "  ✅ gerado:"} ${target}`);
  }

  // Auto-update menu.ts: add import and spread route into last group
  try {
    const menuPath = join(ROOT, "src", "config", "menu.ts").replace(/\\/g, "/");
    let menuContent = await fs.readFile(menuPath, "utf8");
    const importLine = `import { ${ctx.pascal}Routes } from "./pageRoutes/pageRoutes${ctx.pascal}"`;
    const spreadLine = `          ...${ctx.pascal}Routes,`;

    let menuChanged = false;

    // Add import if not present
    if (!menuContent.includes(importLine)) {
      // Insert before 'export interface IMenu'
      menuContent = menuContent.replace(
        /(export interface IMenu)/,
        `${importLine}\n\n$1`
      );
      menuChanged = true;
    }

    // Add spread to last items array before closing of menuGlobal if not present
    if (!menuContent.includes(spreadLine)) {
      // Find last items array closing before the menuGlobal closing ])
      menuContent = menuContent.replace(
        /([ \t]+\.\.\.ParametroTipoDocumentoRoutes)(\s*\],)/,
        `$1,\n${spreadLine}$2`
      );
      menuChanged = true;
    }

    if (menuChanged) {
      await fs.writeFile(menuPath, menuContent, "utf8");
      console.log(`  ✅ atualizado: ${menuPath}`);
    }
  } catch (e) {
    console.warn(`  ⚠️  Não foi possível atualizar menu.ts automaticamente: ${e.message}`);
  }

  console.log("\nGeração concluída. Verifique os arquivos gerados e ajuste os campos do formulário conforme necessário.");
  console.log(`\n📋 Passo manual restante:`);
  console.log(`   - Ajuste os campos do formulário em src/pages/Cadastro/${ctx.pascal}/components/${ctx.pascal}Form.tsx`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
