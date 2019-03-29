/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const assert = require('assert');
const fs = require('fs');
const RMLMapperWrapper = require('./lib/wrapper');
const { strToQuads } = require('./lib/utils');
const { isomorphic } = require("rdf-isomorphic");

const rmlmapperPath = './rmlmapper.jar';
const tempFolderPath = './tmp';

describe('Success', function() {
  it('Simple CSV mapping', async () => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
    };

    // WHEN generating the quads without the metadata and expected the results to by an array of quads
    const result = await wrapper.execute(rml, sources, false, true);

    // THEN the mapping should succeed and the output should match one of the file
    const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
    assert.ok(isomorphic(result.output, expected));
  });
});
