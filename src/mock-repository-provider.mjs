import globby from "globby";
import micromatch from "micromatch";
import { replaceWithOneTimeExecutionMethod } from "one-time-execution-method";
import { MultiGroupProvider, Repository, Branch } from "repository-provider";
import { StringContentEntry } from "content-entry";
import { FileSystemEntry } from "content-entry-filesystem";

export class MockBranch extends Branch {
  async maybeEntry(name) {
    if (this.files[name] === undefined) {
      return undefined;
    }

    return new this.entryClass(name, this.files[name]);
  }

  async entry(name) {
    if (this.files[name] === undefined) {
      throw new Error(`No such object '${name}'`);
    }

    return new this.entryClass(name, this.files[name]);
  }

  async *entries(patterns = "**/*") {
    for (const name of micromatch(Object.keys(this.files), patterns)) {
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
    return this.provider.files[this.fullName];
  }

  get url() {
    return `${this.provider.url}/${this.fullName}`;
  }

  get homePageURL() {
    return `${this.url}#readme`;
  }

  get issuesURL() {
    return `${this.url}/issues`;
  }

  async initializeBranches() {
    for (const name of Object.keys(this.files)) {
      this.addBranch(name);
    }
  }

  /**
   * Full repository name within the provider.
   * @return {string} full repo name
   */
  get fullName() {
    return this.owner === this.provider ||
      this.owner.name === undefined ||
      this.owner.name === ""
      ? this.name
      : [this.owner.name, this.name].join("/");
  }
}

replaceWithOneTimeExecutionMethod(
  MockRepository.prototype,
  "initializeBranches"
);

export class MockFileSystemBranch extends Branch {
  async entry(name) {
    if (this.files[name] === undefined) {
      throw new Error(`No such entry '${name}'`);
    }

    return new this.entryClass(name, this.files[name]);
  }

  async maybeEntry(name) {
    const entry = new FileSystemEntry(name, this.files);
    if (await entry.getExists()) {
      return entry;
    }
    return undefined;
  }

  async entry(name) {
    const entry = new FileSystemEntry(name, this.files);
    if (await entry.getExists()) {
      return entry;
    }
    throw new Error(`Entry not found: ${name}`);
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
  get url() {
    return `${this.provider.url}/${this.fullName}`;
  }

  async initializeBranches() {
    return this.addBranch(this.defaultBranchName);
  }
}

replaceWithOneTimeExecutionMethod(
  MockFileSystemRepository.prototype,
  "initializeBranches"
);

const DEFAULT_GROUP_NAME = "";

/**
 * @param {Object} files
 */
export class MockProvider extends MultiGroupProvider {
  /**
   * We are called mock.
   * @return {string} mock
   */
  static get name() {
    return "mock";
  }

  static get attributes() {
    return {
      ...super.attributes,
      repositoryName: { default: "owner1/repo1" },
      delay: {
        type: "number",
        default: 0
      },
      repositoryBases: {
        default: ["http://mock-provider.com"]
      }
    };
  }

  constructor(files, options) {
    super(options);
    Object.defineProperty(this, "files", {
      value: files
    });
  }

  async waitDelay(delay = this.delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * @return {string} 'http://mock-provider.com'
   */
  get url() {
    return this.repositoryBases[0];
  }

  get branchClass() {
    return typeof this.files === "string" ? MockFileSystemBranch : MockBranch;
  }

  get repositoryClass() {
    return typeof this.files === "string"
      ? MockFileSystemRepository
      : MockRepository;
  }

  async initializeRepositories() {
    const setupRepo = name => {
      let [groupName, repoName] = name.split(/\//);

      if (!repoName) {
        repoName = name;
        groupName = DEFAULT_GROUP_NAME;
      }

      const group = this.addRepositoryGroup(groupName);
      group.addRepository(repoName);
    };

    if (typeof this.files === "string") {
      setupRepo(this.repositoryName);
    } else {
      for (const name of Object.keys(this.files)) {
        setupRepo(name);
      }
    }

    await this.waitDelay();
  }

  async repository(name) {
    const { group, repository } = this.parseName(name);

    if (group == undefined) {
      const g = await this.repositoryGroup(DEFAULT_GROUP_NAME);
      return g ? g.repository(name) : undefined;
    }

    return super.repository(name);
  }

  async branch(name) {
    const { group, repository, branch } = this.parseName(name);

    if (group == undefined) {
      const g = await this.repositoryGroup(DEFAULT_GROUP_NAME);
      return g ? g.branch(name) : undefined;
    }

    return super.branch(name);
  }
}

replaceWithOneTimeExecutionMethod(
  MockProvider.prototype,
  "initializeRepositories"
);

export default MockProvider;
