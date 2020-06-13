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

/**
 * @param {Object} files
 */
export class MockProvider extends MultiGroupProvider {
  static get attributes() {
    return {
      ...super.attributes,
      repositoryName: "owner1/repo1"
    };
  }

  constructor(files, options) {
    super(options);
    Object.defineProperty(this, "files", {
      value: files
    });
  }

  /**
   * @return {string} 'http://mock-provider.com'
   */
  get url() {
    return "http://mock-provider.com";
  }

  get repositoryBases() {
    return [this.url];
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
        groupName = "";
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
  }
}

replaceWithOneTimeExecutionMethod(
  MockProvider.prototype,
  "initializeRepositories"
);
