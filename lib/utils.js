/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const N3 = require('n3');

module.exports = {
  /**
   * This method converts an RDF string to an array of quads.
   * @param str: string-representation of RDF
   * @returns {Promise<any>}: resolved with an array of quads
   */
  strToQuads: str => {
    return new Promise((resolve, reject) => {
      const parser = new N3.Parser();
      const quads = [];

      parser.parse(str, (error, quad) => {
        if (quad) {
          quads.push(quad);
        } else if (error) {
          reject(error);
        } else {
          resolve(quads);
        }
      });
    });
  }
};
