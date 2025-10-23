const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(__dirname, "../package.json");
const lockPath = path.resolve(__dirname, "../package-lock.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));

const required = Object.assign(
  {},
  pkg.dependencies || {},
  pkg.devDependencies || {}
);

const lockPackages = lock.packages || {};
const lockRootDeps =
  lockPackages[""] && lockPackages[""].dependencies
    ? Object.keys(lockPackages[""].dependencies)
    : [];

const missing = [];
for (const name of Object.keys(required)) {
  const key = `node_modules/${name}`;
  if (!lockPackages[key] && !lockRootDeps.includes(name)) {
    missing.push(name);
  }
}

console.log(JSON.stringify({ count: missing.length, missing }, null, 2));
