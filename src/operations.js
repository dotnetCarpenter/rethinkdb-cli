'use strict';

const R = require('rethinkdb');

module.exports = {
    
    tables: function () {
        R.tableList().run(this.conn).then( (list) => {
            const message = this.conn.db + ' has ' + list.join(', ');
            this.fire('message', [message]);
        }, (err) => {
            this.fire('error', [err.msg]);
        });
        return this;
    },
    
    dbs: function () {
        
        R.dbList().run(this.conn).then( (list) => {
            const message = this.conn.host + ' has dbs \'' + list.join('\', \'') + '\'';
            this.fire('message', [message]);
        },() => {
           this.fire('error', [err.msg]); 
        });
        return this;
    },
    
    dbCreate: function (name) {
        R.dbCreate(name).run(this.conn).then( (result) => {
            this.fire('message', [JSON.stringify(result, null, 4)]);
        }, (err) => {
            this.fire('error', [err.msg]);
        });
    },
    
    dbDrop: function(name) {
        R.dbDrop(name).run(this.conn).then(this.defaultResolver.bind(this), this.defaultRejecter.bind(this));
    },
    
    tableCreate: function (name) {
        R.tableCreate(name)
            .run(this.conn)
            .then(
                this.defaultResolver.bind(this), 
                this.defaultRejecter.bind(this)
            );
    },
    
    tableDrop: function (name) {
        R.tableDrop(name)
            .run(this.conn)
            .then(
                this.defaultResolver.bind(this), 
                this.defaultRejecter.bind(this)
            );
    },

    table: function (name, filter) {
        
        if (!name) {
            this.fire('error', ['I need a table name to do that']);
            return this;
        }
        let query = R.table(name);
        
        if (filter) {
            filter = filter.split(':');
            const _filter = {};
            _filter[filter[0]] = filter[1];
            query = query.filter(_filter);
        }

        query.run(this.conn).then( (cursor) => {
            cursor.toArray().then( (items) => {
                this.fire('message', [JSON.stringify(items, null, 4)]);
            }, (err) => {
                this.fire('error', [JSON.stringify(err)]);
            })
        }, (err) => {
            this.fire('error', [err.msg]);
        });

        return this;
    },
    
    insert: function(object,returnChanges) {
        
        if (!object) {
            this.fire('error', ['No objects specified for \'' + name + '\'']);
            return this;
        }

        const tables = Object.keys(object);
        
        const promises = tables.map( (table) => {
            return R.table(table).insert(object[table],{ returnChanges: returnChanges }).run(this.conn);
        });
        
        Promise.all(promises).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        
        return this;
    },

    delete: function (name) {
        
        if (!name) {
            this.fire('error', ['I need a table name to do that']);
            return this;
        }

        R.table(name).delete().run(this.conn).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        return this;
    },

    find: function (id) {

        const msg = ['Find', id].join(' ');
        this.fire('message', [msg]);
        return this;
    },

    quit: function () {

        return this.fire('quit');
    }
};
