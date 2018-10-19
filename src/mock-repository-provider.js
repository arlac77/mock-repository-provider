import { Provider, Repository, Branch, Content } from "repository-provider";

export class MockBranch extends Branch {
  async content(path) {
    if (this.files[path] === undefined) {
      throw new Error(`No such object '${path}'`);
    }

    return new Content(path, this.files[path]);
  }

  get files() {
    return this.repository.files[this.name];
  }
}

export class MockRepository extends Repository {
  get files() {
    return this.provider.files[this.name];
  }

  async _initialize() {
    await super._initialize();

    for (const name of Object.keys(this.files)) {
      await this.createBranch(name);
    }
  }

  get url() {
    return `${this.provider.url}/${this.name}`;
  }

  get homePageURL() {
    return `${this.url}#readme`;
  }

  get issuesURL() {
    return `${this.url}/issues`;
  }
}

/**
 * @param {Object} files
 */
export class MockProvider extends Provider {
  constructor(files) {
    super();
    Object.defineProperty(this, "files", {
      value: files
    });
  }

  async _initialize() {
    await super._initialize();
    for (const name of Object.keys(this.files)) {
      let owner = this;

      const [groupName, repoName] = name.split(/\//);

      if (repoName) {
        owner = await this.createRepositoryGroup(groupName);
      }

      const r = await owner.createRepository(name);
    }
  }

  /**
   * @return {string} 'http://mock-provider.com'
   */
  get url() {
    return "http://mock-provider.com";
  }

  get branchClass() {
    return MockBranch;
  }

  get repositoryClass() {
    return MockRepository;
  }
}
