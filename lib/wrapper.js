/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const N3 = require('n3');
const { DataFactory } = N3;
const { literal } = DataFactory;
const { strToQuads } = require('./utils');

const sourceFilePrefix = "data-";

class RMLMapperWrapper {

  constructor(path, tempFolder, removeTempFolders) {
    this.path = path;
    this.tempFolder = tempFolder;
    this.removeTempFolders = removeTempFolders;

    //check if temp directory exists
    if (!fs.existsSync(this.tempFolder)) {
      fs.mkdirSync(this.tempFolder);
    }
  }

  execute(rml, options = {}) {
    options = Object.assign({
      generateMetadata: false,
      asQuads: false,
      serialization: 'nquads'
    }, options);

    if (!options.asQuads) {
      options.serialization = this._sanitizeSerialization(options.serialization);
    } else {
      options.serialization = 'nquads';
    }

    return new Promise((resolve, reject) => {
      // current time
      const ms = new Date().getTime();
      // folder where the data used by the RMLMapper is stored
      const processDir = path.resolve(this.tempFolder, '' +  ms);

      fs.mkdir(processDir, () => {
        const logFile = path.resolve(processDir, 'rmlmapper.log');
        const sourceDirPrefix = path.resolve(processDir, sourceFilePrefix);
        const self = this;

        const callback = async function (error) {
          if (error) {
            reject(error);
          } else {
            const mappingFile = path.resolve(processDir, 'mapping.rml.ttl');

            try {
              const rmlStr = await self._setSourcesMappingFile(rml, sourceDirPrefix);

              fs.writeFile(mappingFile, rmlStr, function (error) {
                if (error) {
                  reject(error);
                } else {
                  const outputFile = path.resolve(processDir, "output." + options.serialization);
                  const metadataFile = path.resolve(processDir, "metadata." + options.serialization);

                  let execCommand = `java -jar ${self.path} -m ${mappingFile} -o ${outputFile} -s ${options.serialization}`;

                  if (options.generateMetadata) {
                    execCommand += ` -l triple -e ${metadataFile}`;
                  }

                  exec(execCommand, function (error, stdout, stderr) {

                    if (stderr) {
                      fs.writeFileSync(logFile, stderr);
                      const err = new Error(`Error while executing the rules.`);
                      err.log = stderr;
                      reject(err);
                    } else {
                      fs.readFile(outputFile, 'utf8', async (outputErr, output) => {
                        if (outputErr) {
                          outputErr.message = `Error while reading output file '${outputFile}'`;
                          reject(outputErr);
                        } else {
                          if (options.asQuads) {
                            output = await strToQuads(output);
                          }

                          if (options.generateMetadata) {
                            fs.readFile(metadataFile, 'utf8', async (metadataErr, metadata) => {
                              if (metadataErr) {
                                metadataErr.message = `Error while reading output file '${metadataFile}'`;
                                reject(metadataErr);
                              } else {
                                if (asQuads) {
                                  metadata = await strToQuads(metadata);
                                }

                                resolve({output, metadata});
                              }
                            });
                          } else {
                            resolve({output});
                          }
                        }

                        if (self.removeTempFolders) {
                          fs.remove(processDir, err => {
                            if (err) {
                              err.message = `Unable to remove temp folder "${processDir}.`;
                              reject(err)
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            } catch (error) {
              reject(error);
            }
          }
        };

        if (options.sources) {
          this._saveSources(options.sources, sourceDirPrefix)
            .then(callback)
            .catch(reject);
        } else {
          callback();
        }
      });
    });
  }

  _saveSources(sources, prefix) {
    return this._saveSource(Object.keys(sources), 0, sources, prefix);
  }

  async _saveSource(names, index, sources, prefix) {
    return new Promise((resolve, reject) => {
      const self = this;

      async function done() {
        if (index < names.length) {
          await self._saveSource(names, index + 1, sources, prefix);
        }

        resolve();
      }

      if (sources[names[index]]) {
        if (typeof sources[names[index]] === 'string') {
          fs.writeFile(prefix + names[index], sources[names[index]], (err) => {
            if (err) {
              reject(err);
            }

            done();
          });
        } else {
          reject(new Error(`The source with name "${names[index]}" is not string.`));
        }
      } else {
        done();
      }
    });
  }

  async _setSourcesMappingFile(rml, prefix) {
    return new Promise((resolve, reject) => {
      const parser = new N3.Parser();
      const writer = new N3.Writer();

      parser.parse(rml, (error, quad) => {
        if (quad) {
          if (quad.predicate.value === 'http://semweb.mmlab.be/ns/rml#source' && quad.object.termType === 'Literal') {
            quad.object = literal(prefix + quad.object.value);
          }

          writer.addQuad(quad);
        } else {
          writer.end(function (error, result) {
            if (error) {
              reject(error);
            }

            resolve(result);
          });
        }
      });
    });
  }

  _sanitizeSerialization(serialization) {
    serialization = serialization.toLowerCase(serialization);
    return serialization.replace(/[-_]/g, '');
  }
}

module.exports = RMLMapperWrapper;
