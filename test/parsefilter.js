'use strict';

const Code = require('code');
const expect = Code.expect;
const Lab = require('lab');
const ParseFilter = require('../src/parsefilter');
const lab = exports.lab = Lab.script();

lab.experiment('ParseFilter', () => {

    lab.test('it destructures', () => {
        const d = new ParseFilter()
            .destructure('age eq 2');

        expect(d.key).to.equal('age');
    });

    lab.test('it returns a function', () => {
        const pf = new ParseFilter()
            .exec('name eq \'John Doe\'');

        expect(pf).to.be.function();
    });

    lab.test('normalize', () => {
        const pf = new ParseFilter();
        const normalized = pf.normalize({
            key: 'name',
            ops: 'lt',
            value: 23
        });

        expect(normalized.value).to.equal(23);
    });
});
