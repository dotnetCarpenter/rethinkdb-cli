'use strict';

const Code = require('code');   // assertion library
const expect = Code.expect;
const Lab = require('lab');
const Readfile = require('../index').Readfile;
const lab = exports.lab = Lab.script();
const Fs = require('fs');

lab.experiment('Readfile', () => {

    lab.before( () => {

        const data = JSON.stringify({
            people: {
                name: 'John Doe',
                age: 29
            }
        }, null, 4);

        return new Promise((resolve, reject) => {

            Fs.writeFile('./fud.json', data, 'utf8', (err) => {
                if (err) reject(err);
                else resolve();
            });

        });

    });

    lab.after( () => {
        return new Promise((resolve, reject) => {

            Fs.unlink('./fud.json', err => {
                if (err) reject(err);
                else resolve();
            });

        });
    });

    lab.test('it reads', () => {

        return Readfile('./fud.json').then( (data) => {
            expect(data.people.name).to.equal('John Doe');
            expect(data.people.age).to.equal(29);
        });
    });

    lab.test('it doesn\'t read when file is not present', () => {

        return Readfile('./no-file.json').then( () => {}, (err) => {
            expect(err.code).to.equal('ENOENT');
        });
    });
});
