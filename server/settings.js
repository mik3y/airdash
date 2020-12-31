const { AIRDASH_SETTINGS } = process.env;
const os = require("os");
const path = require("path");
const fs = require("fs");
const debug = require("debug")("airdash:settings");

const HOME_DIR = os.homedir();

const absPath = (p) => {
  return path.normalize(p).replace(/^~(?=$|\/|\\)/, HOME_DIR);
};

class Settings {
  constructor() {
    this.settingsFilename = absPath(
      AIRDASH_SETTINGS || "~/.airdash/settings.json"
    );
    this.dataSources = [];
  }

  async load() {
    this.loadFromEnv();
    this.loadFromFile();
    debug(`Settings loaded: ${JSON.stringify(this.toJSON())}`);
  }

  loadFromFile() {
    debug(`Loading settings from ${this.settingsFilename}`);
    if (!fs.existsSync(this.settingsFilename)) {
      debug(`Settings file ${this.settingsFilename} does not exist`);
      return;
    }
    const data = fs.readFileSync(this.settingsFilename);
    const jsonSettings = JSON.parse(data);
    if (jsonSettings.dataSources) {
      this.dataSources = jsonSettings.dataSources;
    }
  }

  loadFromEnv() {
    debug('loading from env', process.env)
    const { DATA_SOURCES } = process.env;
    if (DATA_SOURCES) {
      this.dataSources = DATA_SOURCES.split(",");
    }
  }

  save() {
    const dirName = path.dirname(this.settingsFilename);
    fs.mkdirSync(dirName, { recursive: true });
    const data = this.toJSON();
    fs.writeFileSync(this.settingsFilename, JSON.stringify(data, null, 2));
    debug(`Settings saved to ${this.settingsFilename}`);
  }

  toJSON() {
    return {
      dataSources: this.dataSources,
    };
  }
}

const sSingleton = new Settings();
sSingleton.load();

module.exports = sSingleton;
