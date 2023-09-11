/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const assert = require('assert');
const fs = require('fs');
const RMLMapperWrapper = require('./lib/wrapper');
const { strToQuads } = require('./lib/utils');
const { isomorphic } = require("rdf-isomorphic");
const N3 = require('n3');

const rmlmapperPath = './rmlmapper.jar';
const tempFolderPath = './tmp';

describe('Success', function() {
  this.timeout(5000);

  it('Simple CSV mapping', async () => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
    };

    // WHEN generating the quads without the metadata and expected the results to by an array of quads
    const result = await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});

    // THEN the mapping should succeed and the output should match one of the file
    const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
    assert.ok(isomorphic(result.output, expected));
  });

  it('Simple CSV mapping with metadata', async () => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
    };

    // WHEN generating the quads without the metadata and expected the results to by an array of quads
    const result = await wrapper.execute(rml, {sources, generateMetadata: true, asQuads: true});

    // THEN the mapping should succeed and the output should match one of the file
    const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
    assert.ok(isomorphic(result.output, expected));
    assert.ok(result.metadata.length > 0);
  });

  it('Invalid mapping', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc02/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc02/student.csv', 'utf-8')
    };

    let error;

    try {
      await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});
    } catch (err) {
      error = err;
    }

    assert.strictEqual(error === null, false);
    assert.strictEqual(error.message, `Error while executing the rules.`);
    assert.strictEqual(error.log.indexOf('No Triples Maps found.') !== -1, true);
  });

  it('Serialization: JSON-LD', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc03/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc03/student.csv', 'utf-8')
    };

    const result = await wrapper.execute(rml, {sources, serialization: 'jsonld'});

    let error = null;

    try {
      JSON.parse(result.output);
    } catch (err) {
      error = err;
    }

    assert.ok(error === null);
  });

  it('Serialization: undefined', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc03/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc03/student.csv', 'utf-8')
    };

    let error = null;

    try {
      await wrapper.execute(rml, {sources});
    } catch (err) {
      error = err;
    }

    assert.ok(error === null);
  });

  it('Input: array of quads', done => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const parser = new N3.Parser();
    const rmlQuads = [];

    parser.parse(rml, async (error, quad) => {
      if (quad) {
        rmlQuads.push(quad);
      } else {
        const sources = {
          'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
        };

        // WHEN generating the quads without the metadata and expected the results to by an array of quads
        const result = await wrapper.execute(rmlQuads, {sources, generateMetadata: false, asQuads: true});

        // THEN the mapping should succeed and the output should match one of the file
        const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
        assert.ok(isomorphic(result.output, expected));
        done();
      }
    });
  });

  it('Add Java VM options', done => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true,undefined, undefined, {'Dfile.encoding': 'UTF-8'});
    const rml = fs.readFileSync('./test/tc04/mapping.ttl', 'utf-8');
    const parser = new N3.Parser();
    const rmlQuads = [];

    parser.parse(rml, async (error, quad) => {
      if (quad) {
        rmlQuads.push(quad);
      } else {
        const sources = {
          'student.csv': fs.readFileSync('./test/tc04/student.csv', 'utf-8')
        };

        // WHEN generating the quads without the metadata and expected the results to by an array of quads
        const result = await wrapper.execute(rmlQuads, {sources, generateMetadata: false, asQuads: true});

        // THEN the mapping should succeed and the output should match one of the file
        const expected = await strToQuads(fs.readFileSync('./test/tc04/output.nq', 'utf-8'));
        assert.ok(isomorphic(result.output, expected));
        done();
      }
    });
  });

  it.skip('Parameter: functions', done => {
    // GIVEN a wrapper, a JSON input, and an additional function
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, false);
    const rml = fs.readFileSync('./test/tc05/mapping.ttl', 'utf-8');
    const parser = new N3.Parser();
    const rmlQuads = [];

    parser.parse(rml, async (error, quad) => {
      if (quad) {
        rmlQuads.push(quad);
      } else {
        const sources = {
          'message.json': fs.readFileSync('./test/tc05/message.json', 'utf-8')
        };
        const fnoStr = fs.readFileSync('./test/tc05/functions_all.nt', 'utf-8');

        // WHEN generating the quads with additional functions as parameter
        const result = await wrapper.execute(rmlQuads, {sources, generateMetadata: false, asQuads: true, fno: fnoStr});

        // THEN the mapping should succeed and the output should match one of the file
        const expected = await strToQuads(fs.readFileSync('./test/tc05/output.nq', 'utf-8'));
        assert.ok(isomorphic(result.output, expected));
        done();
      }
    });
  });

  it('Single target', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc06/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc06/student.csv', 'utf-8')
    };

    let result = await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});
    assert.deepStrictEqual(result.output.stdout, []);

    result = await strToQuads(result.output['dump1.nt']);

    const expected = await strToQuads(fs.readFileSync('./test/tc06/output.nq', 'utf-8'));
    assert.ok(isomorphic(result, expected));
  });

  it('Two targets', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc07/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc07/student.csv', 'utf-8')
    };

    let result = await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});
    assert.deepStrictEqual(result.output.stdout, []);

    const result1 = await strToQuads(result.output['dump1.nt']);
    const expected1 = await strToQuads(fs.readFileSync('./test/tc07/output-1.nq', 'utf-8'));
    assert.ok(isomorphic(result1, expected1));

    const result2 = await strToQuads(result.output['dump2.nt']);
    const expected2 = await strToQuads(fs.readFileSync('./test/tc07/output-2.nq', 'utf-8'));
    assert.ok(isomorphic(result2, expected2));
  });

  it('Data source in subdirectory', async () => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc08/mapping.ttl', 'utf-8');
    const sources = {
      './data/student.csv': fs.readFileSync('./test/tc08/data/student.csv', 'utf-8')
    };

    // WHEN generating the quads without the metadata and expected the results to by an array of quads
    const result = await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});

    // THEN the mapping should succeed and the output should match one of the file
    const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
    assert.ok(isomorphic(result.output, expected));
  });

  it('Configure function state ID and test state', async () => {
    const stateFolder = tempFolderPath + '/fstate';
    const wrapper = new RMLMapperWrapper(
        rmlmapperPath,
        tempFolderPath,
        false,
        stateFolder,
        60);

    const rml = fs.readFileSync('./test/functionstate/mapping.ttl', 'utf-8');
    const sources1 = {
      'student.csv': fs.readFileSync('./test/functionstate/student.csv', 'utf-8')
    };
    const sources2 = {
      'student.csv': fs.readFileSync('./test/functionstate/student.csv', 'utf-8')
    };

    // Do a first run.
    const result1 = await wrapper.execute(rml, {sources: sources1, generateMetadata: false, asQuads: true, functionStateId: 'test state id'});
    const expected1 = await strToQuads(fs.readFileSync('./test/functionstate/output1.nq', 'utf-8'));
    assert.ok(isomorphic(result1.output, expected1));

    // Do a second run. The result should be empty, because the function used in the mappings
    // only produces an IRI when it is not produced before.
    const result2 = await wrapper.execute(rml, {sources: sources2, generateMetadata: false, asQuads: false, functionStateId: 'test state id'});
    assert.equal(result2.output, '');

    // remove temp folder
    fs.rm(tempFolderPath, {recursive: true}, () => {});

  });
});
