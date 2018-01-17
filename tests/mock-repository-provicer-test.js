import test from 'ava';
import { MockProvider } from '../src/mock-repository-provider';

const files = {
  repo1: {
    master: {
      aFile: 'content'
    }
  }
};

test('provider repository', async t => {
  const provider = new MockProvider(files);
  //await provider.initialize();

  const r = await provider.repository('repo1');
  t.is(r.name, 'repo1');
  const b = await r.branch('master');
  t.is(b.name, 'master');
});

test('provider branch', async t => {
  const provider = new MockProvider(files);
  //await provider.initialize();

  const b = await provider.branch('repo1#master');
  t.is(b.name, 'master');
});

test('repository content', async t => {
  const provider = new MockProvider(files);
  //await provider.initialize();

  t.is(await (await provider.repository('repo1')).content('aFile'), 'content');
});

test('branch content', async t => {
  const provider = new MockProvider(files);
  //await provider.initialize();

  t.is(
    await (await provider.branch('repo1#master')).content('aFile'),
    'content'
  );
});
