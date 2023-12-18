const fs = require("fs");
const path = require("path");
const he = require("he");

const expectedHeaderRegexp = /<html>\r?\n<head><title>Index of (.+?)<\/title>/;

const indexDir = path.resolve(process.cwd(), process.argv[2]);
const baseUrl = process.argv[3];
async function walk(directory) {
  const values = [];
  const stat = await fs.promises.stat(directory);

  if (stat.isDirectory()) {
    const listing = await fs.promises.readdir(directory);
    const fullPaths = listing.map((filename) => path.resolve(directory, filename));
    const walkPromises = fullPaths.map(async (filename) => {
      return walk(filename);
    });
    values.push((await Promise.all(walkPromises)).flat());
  } else {
    values.push(directory);
  }
  return values.flat();
}

// Just in case they left a not-generated index.html file somewhere in the dump
function checkIndexFile(content, indexDir, filename) {
  if (path.basename(filename) != "index.html") return false;
  const headerMatch = content.match(expectedHeaderRegexp);
  if (!headerMatch) return false;
  const expectedPath = "/" + path.relative(indexDir, path.dirname(filename)).replace(/\\ /g, " ") + "/";
  const gotPath = he.decode(headerMatch[1]);
  console.log(expectedPath);
  console.log(gotPath);
  if (expectedPath === gotPath) return true;
  return false;
}

async function run() {
  const urls = [];

  const indexFilenames = await walk(indexDir);
  console.log(indexFilenames.length);
  for (let filename of indexFilenames) {
    const content = await fs.promises.readFile(filename, { encoding: "utf-8" });
    if (!checkIndexFile(content, indexDir, filename)) {
      console.warn("Skipping possibly static html file at " + filename);
      continue;
    }
    const matches = content.matchAll(/^<a href="(.+?(?<!\/))">/gm);
    for (match of matches) {
      const dirname = path.relative(indexDir, path.dirname(filename));
      const url = baseUrl + "/" + encodeURI(dirname) + "/" + match[1];

      urls.push(`${url}\n dir=${dirname}\n out=${decodeURI(match[1])}`);
    }
  }
  console.log("Parsed " + urls.length + " urls")
  await fs.promises.writeFile("urls.txt", urls.join("\n"));
}

run();
