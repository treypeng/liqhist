
CREATE TABLE IF NOT EXISTS liquidation (
  /* not needed, saved so you can look up/check the rest of the table fields
  at the original source using this url:
  https://www.bitmex.com/api/v1/chat?count=1&reverse=false&start={trollbox_id}  */
  trollbox_id integer NOT NULL,

  /* interesting fields */
  timestamp integer NOT NULL,
  instrument text NOT NULL,
  position text NOT NULL,
  side text NOT NULL,
  contracts integer NOT NULL,
  price real NOT NULL
);
