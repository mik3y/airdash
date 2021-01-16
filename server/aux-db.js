const os = require("os");
const path = require("path");
const fs = require("fs");
const debug = require("debug")("airdash:aux-db");

class AuxDb {
  constructor() {
    this.aircrafts = {};
    this.operators = {};
    this.types = {};
  }

  load() {
    this.aircrafts = this.loadDbFile('aircrafts.json');
    this.operators = this.loadDbFile('operators.json');
    this.types = this.loadDbFile('types.json');
  }
  
  loadDbFile(filename) {
    const path = `${__dirname}/../db/${filename}`;
    if (!fs.existsSync(path)) {
      debug(`Data for ${filename} not found (path: ${path})`);
      return {};
    }
    try {
      const raw = fs.readFileSync(path);
      const data = JSON.parse(raw);
      debug(`Loaded ${filename}`);
      return data;
    } catch (e) {
      debug(`Failed to load ${filename}`);
      return {};
    }
  }
}

const sSingleton = new AuxDb();
sSingleton.load();
module.exports = sSingleton;
