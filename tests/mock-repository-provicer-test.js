import test from 'ava';
import { MockProvider } from '../src/mock-repository-provider';

test('mock provider content', async t => {
  const provider = new MockProvider({
    aFile: {
      templateRepo: 'content'
    }
  });
  t.is(
    await (await provider.repository('templateRepo')).content('aFile'),
    'content'
  );
});
