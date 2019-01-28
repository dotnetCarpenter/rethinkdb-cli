'use strict';

const Code = require('code');   // assertion library
const expect = Code.expect;
const Lab = require('lab');
const Commander = require('../index').Commander;
const lab = exports.lab = Lab.script();
let commander;

const host = process.env['RETHINKDB_TCP_ADDR'] || 'localhost';

lab.experiment('Commander', () => {

    lab.beforeEach( () => {
        return new Promise(resolve => {
            commander = new Commander();
            resolve();
        });
    });

    lab.test('connect', () => {
        return new Promise(resolve => {
            commander.on('connect', (msg) => {

                expect(msg).to.match(/Connected to/);
                resolve();
            });

            commander.connect({ host: host, db: 'test' });
        });
    });

    lab.test('does not connect', () => {
        return new Promise(resolve => {
            commander.connect = function () {

                this.emit('error', 'mocking this');
            };

            commander.close = () => {};

            commander.on('error', (msg) => {
                expect(msg).to.match(/mocking this/);
                resolve();
            });

            commander.connect({ host: host, db: 'test' });
        });
    });

    lab.test('it has status \'not connected\'', () => {
        commander.conn = null;
        expect(commander.status()).to.equal('Not connected');
    });

    lab.test('it has status connected', () => {
        return new Promise(resolve => {
            commander.on('connect', () => {
                expect(commander.status()).to.equal(`${host}:28015/test`);
                resolve();
            });

            commander.connect({ host: host, db: 'test' });
        });
    });

    lab.test('execString', () => {
        return new Promise(resolve => {
            commander.on('message', (list) => {
                expect(list).to.be.string();
                resolve();
            });

            commander.on('connect', (msg) => {
                commander.execString('tableList');
            });

            commander.connect({ host: host, db: 'test' });
        });
    });

    lab.test('emit', () => {
        expect(commander.emit('bogus', 1,2,3)).to.be.undefined();
    });

    lab.test('exec', () => {
        expect(commander.exec('bogus', 1,2,3)).to.equal(commander);
    });

    lab.test('defaultResolver', () => {
        expect(commander.defaultResolver({ name: 'bogus' })).to.be.undefined();
    });

    lab.test('defaultRejecter', () => {
        expect(commander.defaultRejecter({ name: 'bogus' })).to.be.undefined();
    });

    lab.test('close', () => {
        return new Promise(resolve => {
            commander.connect({ host: host, db: 'test' });
            commander.on('connect', () => {
                commander.close();
                resolve();
            });
        });
    });

    lab.test('quit', () => {
        commander.operations.quit.call(commander);
    });

    lab.test('use', () => {
        return new Promise(resolve => {
            commander.on('message', (msg) => {
                expect(msg).to.equal('Using test');
                resolve();
            });

            commander.on('connect', () => {
                commander.operations.use.call(commander, 'test');
            });

            commander.connect({ host: host, db: 'test' });
        });
    });

    lab.test('help', () => {
        commander.operations.help.call(commander);
    });

    lab.test('tableList', () => {
        return new Promise(resolve => {
            commander.on('connect', (msg) => {
                expect(commander.operations.tableList.call(commander)).to.equal(commander);
                resolve();
            });
            commander.connect({ host: host, db: 'bogus' });
        })
    });
});
