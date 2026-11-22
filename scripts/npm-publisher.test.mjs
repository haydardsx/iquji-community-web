import assert from "node:assert/strict";
import { test } from "node:test";
import { publisherEmail, verifyPublisher } from "./npm-publisher.mjs";

test("npm 机器身份只接受绑定标签、来源和归档摘要的签名", async () => {
  const name = "@iquji-community/web-icons", version = "1.2.3";
  const repo = "https://github.com/haydardsx/iquji-community-web", ref = "refs/tags/v1.2.3";
  const predicateType = "https://slsa.dev/provenance/v1", digest = "a".repeat(128), commit = "b".repeat(40);
  const entry = {name, version,
    _npmUser: {name: "GitHub Actions", email: publisherEmail, trustedPublisher: {
      id: "github", oidcConfigId: "12345678-1234-4567-8901-123456789abc"}},
    dist: {integrity: "sha512-" + Buffer.from(digest, "hex").toString("base64"),
      attestations: {url: `https://registry.npmjs.org/-/npm/v1/attestations/${name}@${version}`, provenance: {predicateType}}}};
  const statement = {predicateType, subject: [{name: `pkg:npm/%40iquji-community/web-icons@${version}`, digest: {sha512: digest}}],
    predicate: {buildDefinition: {externalParameters: {workflow: {repository: repo, path: ".github/workflows/release.yml", ref}},
      internalParameters: {github: {repository_id: "1465442794"}},
      resolvedDependencies: [{uri: `git+${repo}@${ref}`, digest: {gitCommit: commit}}]}}};
  const fetchImpl = async () => Response.json({attestations: [{predicateType,
    bundle: {dsseEnvelope: {payload: Buffer.from(JSON.stringify(statement)).toString("base64")}}}]});
  const signature = async (bundle, options) => {
    assert.ok(bundle.dsseEnvelope);
    assert.equal(options.certificateIdentityURI, `${repo}/.github/workflows/release.yml@${ref}`);
    assert.equal(options.certificateIssuer, "https://token.actions.githubusercontent.com");
  };
  const verify = (check = signature) => verifyPublisher(name, version, entry, fetchImpl, check, () => commit);
  await verify();
  await assert.rejects(verify(async () => { throw new Error("签名无效"); }));
  entry._npmUser.trustedPublisher.id = "example"; await assert.rejects(verify());
  entry._npmUser.trustedPublisher.id = "github";
  statement.subject[0].digest.sha512 = "c".repeat(128); await assert.rejects(verify());
});
