import globby from "globby";
import { Provider, Repository, Branch } from "repository-provider";
import { StringContentEntry, FileSystemEntry } from "content-entry";

export class MockBranch extends Branch {
  async entry(name) {
    if (this.files[name] === undefined) {
      throw new Error(`No such object '${name}'`);
    }

    return new this.entryClass(name, this.files[name]);
  }

  async *entries(filter) {
    for (const name of this.files) {
      yield new this.entryClass(name, this.files[name]);
    }
  }

  get files() {
    return this.repository.files[this.name];
  }

  get entryClass() {
    return StringContentEntry;
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

export class MockFileSystemBranch extends Branch {
  async entry(name) {
    if (this.files[name] === undefined) {
      throw new Error(`No such object '${name}'`);
    }

    return new this.entryClass(name, this.files[name]);
  }

  async entry(name) {
    const entry = new FileSystemEntry(name, this.files);
    if (await entry.getExists()) {
      return entry;
    }
    throw new Error(`file not found: ${name}`);
  }

  async *entries(matchingPatterns = ["**/.*", "**/*"]) {
    for (const name of await globby(matchingPatterns, {
      cwd: this.files
    })) {
      yield new this.entryClass(name, this.files);
    }
  }

  get files() {
    return this.provider.files;
  }

  get entryClass() {
    return FileSystemEntry;
  }
}

export class MockFileSystemRepository extends Repository {
  async _initialize() {
    await super._initialize();

    const branch = await this.createBranch(this.defaultBranchName);
  }

  get url() {
    return `${this.provider.url}/${this.name}`;
  }
}

/**
 * @param {Object} files
 */
export class MockProvider extends Provider {
  static get defaultOptions() {
    return {
      repositoryName: "owner1/repo1",
      ...super.defaultOptions
    };
  }

  constructor(files, options) {
    super(options);
    Object.defineProperty(this, "files", {
      value: files
    });
  }

  async _initialize() {
    await super._initialize();

    const setupRepo = async name => {
      let owner = this;

      const [groupName, repoName] = name.split(/\//);

      if (repoName) {
        owner = await this.createRepositoryGroup(groupName);
      }

      await owner.createRepository(name);
    };

    if (typeof this.files === "string") {
      await setupRepo(this.repositoryName);
    } else {
      for (const name of Object.keys(this.files)) {
        await setupRepo(name);
      }
    }
  }

  /**
   * @return {string} 'http://mock-provider.com'
   */
  get url() {
    return "http://mock-provider.com";
  }

  get branchClass() {
    return typeof this.files === "string" ? MockFileSystemBranch : MockBranch;
  }

  get repositoryClass() {
    return typeof this.files === "string"
      ? MockFileSystemRepository
      : MockRepository;
  }
}
