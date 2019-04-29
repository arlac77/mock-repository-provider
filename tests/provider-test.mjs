import test from "ava";
import { MockProvider } from "../src/mock-repository-provider.mjs";

const files = {
  repo1: {
    master: {
      aFile: "content"
    }
  },
  ["owner1/repo2"]: {
    master: {
      aFile: "content"
    }
  }
};

test("provider repositoryGroup", async t => {
  const provider = new MockProvider(files);
  const g1 = await provider.repositoryGroup("owner1");
  t.is(g1.name, "owner1");
});

test("provider repositoryGroups", async t => {
  const provider = new MockProvider(files);
  const grps = {};
  for await (const g of provider.repositoryGroups("*")) {
    grps[g.name] = g;
  }

  t.is(grps.owner1.name, "owner1");
});

test("provider repository", async t => {
  const provider = new MockProvider(files);
  t.is(provider.url, "http://mock-provider.com");

  const r = await provider.repository("repo1");
  t.is(r.name, "repo1");
  t.is(r.owner, provider);
  t.is(r.url, "http://mock-provider.com/repo1");
  t.is(r.homePageURL, "http://mock-provider.com/repo1#readme");
  t.is(r.issuesURL, "http://mock-provider.com/repo1/issues");
  const b = await r.branch("master");
  t.is(b.name, "master");
});

test("provider repositories", async t => {
  const provider = new MockProvider(files);

  const rps = {};
  for await (const r of provider.repositories("*")) {
    rps[r.name] = r;
  }

  t.is(rps.repo1.name, "repo1");
});

test("provider repository with owner", async t => {
  const provider = new MockProvider(files);
  t.is(provider.url, "http://mock-provider.com");

  const r = await provider.repository("owner1/repo2");
  t.is(r.name, "owner1/repo2");
  t.is(r.provider, provider);
  t.is(r.owner, await provider.repositoryGroup("owner1"));
});

test("provider repository with owner and branch", async t => {
  const provider = new MockProvider(files);
  const r = await provider.repository("owner1/repo2#master");
  t.is(r.name, "owner1/repo2");
  t.is(r.provider, provider);
  t.is(r.owner, await provider.repositoryGroup("owner1"));
});

test("provider branch", async t => {
  const provider = new MockProvider(files);

  const b = await provider.branch("repo1#master");
  t.is(b.name, "master");
  t.is(b.provider, provider);
  t.is(b.owner, provider);
  t.is(b.url, "http://mock-provider.com/repo1");
});

test("provider branch with owner", async t => {
  const provider = new MockProvider(files);

  const b = await provider.branch("owner1/repo2#master");

  t.is(b.name, "master");
  t.is(b.provider, provider);
  t.is(b.owner, await provider.repositoryGroup("owner1"));
  t.is(b.url, "http://mock-provider.com/owner1/repo2");
});

test("repository entry", async t => {
  const provider = new MockProvider(files);

  const c = await (await provider.repository("repo1")).entry("aFile");

  t.is(await c.getString(), "content");
  t.true(c.isBlob);
  t.is(c.name, "aFile");
});

test("branch entry", async t => {
  const provider = new MockProvider(files);

  const c = await (await provider.branch("repo1#master")).entry("aFile");

  t.is(await c.getString(), "content");
});
