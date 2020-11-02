import test from "ava";
import MockProvider from "mock-repository-provider";

const PROVIDER_BASE = "https://my-provider.com";

const provider = new MockProvider(new URL("..", import.meta.url).pathname, {
  repositoryName: "owner2/repository2",
  repositoryBases: [PROVIDER_BASE]
});

test("fs repositoryGroup", async t => {
  const g1 = await provider.repositoryGroup("owner2");
  t.is(g1.name, "owner2");
});

test.skip("fs repositoryGroup with base", async t => {
  const g1 = await provider.repositoryGroup(PROVIDER_BASE + "/owner2");
  t.is(g1.name, "owner2");
});

test("fs branch", async t => {
  const b = await provider.branch("owner2/repository2#master");
  t.is(b.name, "master");
  t.is(b.provider, provider);
  t.is(b.url, PROVIDER_BASE + "/owner2/repository2");
});

test("fs entry", async t => {
  const b = await provider.branch("owner2/repository2#master");
  const c = await b.entry("package.json");

  t.true((await c.getString()).startsWith("{"));
  t.true(c.isBlob);
  t.is(c.name, "package.json");
});

test("fs maybeEntry", async t => {
  const b = await provider.branch("owner2/repository2#master");
  const c = await b.maybeEntry("package.json");

  t.true((await c.getString()).startsWith("{"));
  t.true(c.isBlob);
  t.is(c.name, "package.json");
});
