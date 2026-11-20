import assert from "node:assert/strict";
import { test } from "node:test";
import { auditRegistry } from "./registry-identity.mjs";

test("注册表资料必须包含经受信环境核实的公开发行地址", async (context) => {
  const key = "COMMUNITY_RELEASE_EMAIL";
  const previous = process.env[key];
  context.after(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });
  const name = "@iquji-community/web-icons";
  delete process.env[key];
  await assert.rejects(auditRegistry([name]), /缺少经核实/);
  process.env[key] = "release@example.invalid";
  const record = (email) => async () => Response.json({
    name, maintainers: [{ name: "example", email: process.env[key] }], versions: { "0.2.0": { _npmUser: { email } } },
  });
  assert.equal(await auditRegistry([name], { fetchImpl: record(process.env[key]) }), 1);
  await assert.rejects(auditRegistry([name], { fetchImpl: record("other@example.invalid") }));
  assert.equal(await auditRegistry([name], { allowMissing: true, fetchImpl: async () => new Response(null, { status: 404 }) }), 0);
  await assert.rejects(auditRegistry([name], { allowMissing: false, fetchImpl: async () => new Response(null, { status: 404 }) }), /HTTP 404/);
});
