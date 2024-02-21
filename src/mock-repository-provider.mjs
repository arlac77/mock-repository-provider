import { globby } from "globby";
import micromatch from "micromatch";
import { replaceWithOneTimeExecutionMethod } from "one-time-execution-method";
import { MultiGroupProvider, Repository, Branch } from "repository-provider";
import { StringContentEntry } from "content-entry";
import { FileSystemEntry } from "content-entry-filesystem";

export class MockBranch extends Branch {
  // @ts-ignore
  async maybeEntry(name) {
    if (this.files[name] === undefined) {
      return undefined;
    }

    return new this.entryClass(name, this.files[name]);
  }

  // @ts-ignore
  async entry(name) {
    if (this.files[name] === undefined) {
      throw new Error(`No such object '${name}'`);
    }

    return new this.entryClass(name, this.files[name]);
  }

  // @ts-ignore

  async *entries(patterns = "**/*") {
    for (const name of micromatch(Object.keys(this.files), patterns)) {
      yield new this.entryClass(name, this.files[name]);
    }
  }

  get files() {
    // @ts-ignore
    return this.repository.files[this.name];
  }

  get entryClass() {
    return StringContentEntry;
  }
}

/**
 *
 */
export class MockRepository extends Repository {
  get files() {
    // @ts-ignore
    return this.provider.files[this.fullName];
  }

  get url() {
    // @ts-ignore
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
  // @ts-ignore
  async maybeEntry(name) {
    const entry = new FileSystemEntry(name, this.files);
    if (await entry.isExistent) {
      return entry;
    }
  }

  // @ts-ignore

  async entry(name) {
    const entry = new FileSystemEntry(name, this.files);
    if (await entry.isExistent) {
      return entry;
    }
    throw new Error(`Entry not found: ${name}`);
  }

  // @ts-ignore
  async *entries(matchingPatterns = ["**/.*", "**/*"]) {
    for (const name of await globby(matchingPatterns, {
      cwd: this.files
    })) {
      yield new this.entryClass(name, this.files);
    }
  }

  get files() {
    // @ts-ignore

    return this.provider.files;
  }

  get entryClass() {
    return FileSystemEntry;
  }
}

export class MockFileSystemRepository extends Repository {
  get url() {
    // @ts-ignore
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
    // @ts-ignore
    super(options);
    Object.defineProperty(this, "files", {
      value: files
    });
  }

  // @ts-ignore
  async waitDelay(delay = this.delay) {
    // @ts-ignore
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * @return {string} 'http://mock-provider.com'
   */
  get url() {
    return this.repositoryBases[0];
  }

  // @ts-ignore
  get branchClass() {
    // @ts-ignore
    return typeof this.files === "string" ? MockFileSystemBranch : MockBranch;
  }

  get repositoryClass() {
    // @ts-ignore
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

    // @ts-ignore
    if (typeof this.files === "string") {
      // @ts-ignore

      setupRepo(this.repositoryName);
    } else {
      // @ts-ignore

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
