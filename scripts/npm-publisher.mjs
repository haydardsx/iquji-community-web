import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { root } from "./package.mjs";

export const publisherEmail = "npm-oidc-no-reply@github.com";
const repo = "https://github.com/haydardsx/iquji-community-web";
const workflow = ".github/workflows/release.yml";
const predicate = "https://slsa.dev/provenance/v1";

async function verifySignature(bundle, options) {
  // 使用当前 npm 发行版自带的 Sigstore 验证器，信任根与 npm 发布工具保持一致。
  const globalModules = execFileSync("npm", ["root", "--global"], {encoding: "utf8"}).trim();
  const {verify} = createRequire(join(globalModules, "npm/package.json"))("sigstore");
  await verify(bundle, options);
}

export async function verifyPublisher(name, version, entry, fetchImpl = fetch, checkSignature = verifySignature,
    resolveTag = (tag) => execFileSync("git", ["rev-parse", "--verify", `refs/tags/${tag}^{commit}`], {cwd: root, encoding: "utf8"}).trim()) {
  const user = entry._npmUser;
  assert.ok(user?.name === "GitHub Actions" && user.email === publisherEmail && user.trustedPublisher?.id === "github");
  assert.match(user.trustedPublisher.oidcConfigId, /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/);
  assert.ok(entry.name === name && entry.version === version && /^\d+\.\d+\.\d+$/.test(version));
  const url = new URL(entry.dist.attestations.url);
  assert.equal(url.origin, "https://registry.npmjs.org");
  assert.equal(decodeURIComponent(url.pathname), `/-/npm/v1/attestations/${name}@${version}`);
  assert.equal(entry.dist.attestations.provenance.predicateType, predicate);
  const response = await fetchImpl(url, {redirect: "error", signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`无法读取 ${name} 的来源证明（HTTP ${response.status}）。`);
  const matching = (await response.json()).attestations.filter((item) => item.predicateType === predicate);
  assert.equal(matching.length, 1);
  const bundle = matching[0].bundle;
  const tag = `v${version}`;
  const ref = `refs/tags/${tag}`;
  await checkSignature(bundle, {certificateIssuer: "https://token.actions.githubusercontent.com",
    certificateIdentityURI: `${repo}/${workflow}@${ref}`});
  const statement = JSON.parse(Buffer.from(bundle.dsseEnvelope.payload, "base64"));
  assert.equal(statement.predicateType, predicate);
  const definition = statement.predicate.buildDefinition;
  assert.deepEqual(definition.externalParameters.workflow, {repository: repo, path: workflow, ref});
  assert.equal(definition.internalParameters.github.repository_id, "1465442794");
  const commit = resolveTag(tag);
  assert.match(commit, /^[a-f0-9]{40}$/);
  assert.ok(definition.resolvedDependencies.some((item) => item.uri === `git+${repo}@${ref}` && item.digest?.gitCommit === commit));
  assert.equal(statement.subject.length, 1);
  const subject = statement.subject[0];
  assert.equal(subject.name, `pkg:npm/${name.replace("@", "%40")}@${version}`);
  assert.match(subject.digest.sha512, /^[a-f0-9]{128}$/);
  assert.equal(entry.dist.integrity, "sha512-" + Buffer.from(subject.digest.sha512, "hex").toString("base64"));
}
