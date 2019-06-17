


// Just an SQLite helper, pretty self-explanatory
// sqlite is great btw.

let sqlite = require('better-sqlite3'); // we're using the synchronous version of sqlite
let fs = require('fs');

// default db, overrideable in the contstructor
const DB = './db/mexliq.db';

// table definition file
const SQL_CANDLE_TABLE = './db/create-liq.sql';

module.exports = function(db_override=null)
{
  var that = this;

  let db_path = db_override || DB;
  // create or open the db
  this.db = new sqlite(db_path);

  console.log(`WRITING TO DATABASE: '${db_path}'`);

  // exec the definition every time
  this.db.exec(fs.readFileSync(SQL_CANDLE_TABLE, 'utf8'));

  this.dump = function()
  {
    // just a debugging method change as needed
    let s = this.db.prepare(`SELECT * FROM liquidation WHERE trollbox_id >= 6058000`);
    return s.all();
  };

  this.all = function()
  {
    let s = this.db.prepare(`SELECT * FROM liquidation order by trollbox_id ASC`);
    return s.all();
  };


  this.getliqs = function(instr)
  {
    let s = this.db.prepare(`SELECT * FROM liquidation WHERE instrument = '${instr}' ORDER BY timestamp ASC`);
    return s.all();
  };

  this.getliqsbydate = function(datefrom, dateto)
  {
    let qry = `SELECT * FROM liquidation WHERE (timestamp >=${datefrom} and timestamp <=${dateto}) ORDER BY timestamp ASC`;
    let s = this.db.prepare(qry);
    return s.all();
  };

  this.debug = function()
  {
    console.log('liq-db-manager: deprecated');
    // let s = this.db.prepare(`DELETE FROM liquidation WHERE trollbox_id >= 6058000`);
    // console.log(s.run());
  }

  // add a bunch of liqudiations, typically around a dozen at a time per page
  this.add_range = function(candles)
  {
      for (let c of candles)
        this.add(c);
  };

  this.add = function(liq)
  {

   let s = this.db.prepare('INSERT INTO liquidation VALUES(?, ?, ?, ?, ?, ?, ?)');
   return s.run(this._flatten(liq));

  };


  this._flatten = function(obj)
  {
    return [ obj.id, obj.timestamp, obj.instrument, obj.position,
      obj.side, obj.contracts, obj.price ];
  };

}
