import test from 'ava';
import { MockProvider } from '../src/mock-repository-provider';

const files = {
  repo1: {
    master: {
      aFile: 'content'
    }
  },
  ['owner1/repo1']: {
    master: {
      aFile: 'content'
    }
  }
};

test('provider repository', async t => {
  const provider = new MockProvider(files);
  t.is(provider.url, 'http://mock-provider.com');

  const r = await provider.repository('repo1');
  t.is(r.name, 'repo1');
  t.is(r.owner, provider);
  t.is(r.url, 'http://mock-provider.com/repo1');
  t.is(r.homePageURL, 'http://mock-provider.com/repo1#readme');
  t.is(r.issuesURL, 'http://mock-provider.com/repo1/issues');
  const b = await r.branch('master');
  t.is(b.name, 'master');
});

test('provider repository with owner', async t => {
  const provider = new MockProvider(files);
  t.is(provider.url, 'http://mock-provider.com');

  const r = await provider.repository('owner1/repo1');
  t.is(r.name, 'owner1/repo1');
  t.is(r.owner, provider);
});

test('provider branch', async t => {
  const provider = new MockProvider(files);

  const b = await provider.branch('repo1#master');
  t.is(b.name, 'master');
  t.is(b.url, 'http://mock-provider.com/repo1');
});

test('repository content', async t => {
  const provider = new MockProvider(files);

  const c = await (await provider.repository('repo1')).content('aFile');

  t.is(c.content, 'content');
});

test('branch content', async t => {
  const provider = new MockProvider(files);

  const c = await (await provider.branch('repo1#master')).content('aFile');

  t.is(c.content, 'content');
});
