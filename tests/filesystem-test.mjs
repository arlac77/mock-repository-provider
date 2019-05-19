import test from "ava";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { MockProvider } from "../src/mock-repository-provider.mjs";

const here = dirname(fileURLToPath(import.meta.url));

const provider = new MockProvider(join(here, ".."), {
  repositoryName: "owner2/repository2"
});

test("fs repositoryGroup", async t => {
  const g1 = await provider.repositoryGroup("owner2");
  t.is(g1.name, "owner2");
});

test.skip("fs branch", async t => {
  const b = await provider.branch("owner2/repository2#master");
  t.is(b.name, "master");
  t.is(b.provider, provider);
  t.is(b.url, "http://mock-provider.com/owner2/repository2");
});

test("fs entry", async t => {
  const b = await provider.branch("owner2/repository2#master");
  const c = await b.entry("package.json");

  t.true((await c.getString()).startsWith("{"));
  t.true(c.isBlob);
  t.is(c.name, "package.json");
});
