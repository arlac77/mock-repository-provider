import { Provider, Repository, Branch } from 'repository-provider';

export class MockBranch extends Branch {
  async content(path, options = {}) {
    if (this.files[path] === undefined) {
      if (options.ignoreMissing) {
        return '';
      }
      return undefined;
    }

    return this.files[path];
  }

  get files() {
    return this.repository.files[this.name];
  }
}

export class MockRepository extends Repository {
  get files() {
    return this.provider.files[this.name];
  }

  async initialize() {
    await super.initialize();
    await Promise.all(
      Object.keys(this.files).map(branchName => this.createBranch(branchName))
    );
  }
}

/**
 * @param {Object} files
 */
export class MockProvider extends Provider {
  constructor(files) {
    super();
    Object.defineProperty(this, 'files', {
      value: files
    });
  }

  async initialize() {
    return Promise.all(
      Object.keys(this.files).map(repoName => this.createRepository(repoName))
    );
  }

  get branchClass() {
    return MockBranch;
  }

  get repositoryClass() {
    return MockRepository;
  }
}
