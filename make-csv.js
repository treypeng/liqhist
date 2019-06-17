
let LiqManager = require('./liq-db-mgr.js');
let mgr = new LiqManager('./db/mexliq-deduped.db');

// Get all the liqs
let liqs = mgr.all();

let dupes = 0;

// Check for duplicates here
// Shouldn't have this problem but check just in case
for (let t=0; t<liqs.length-1; t++)
{
  let l1 = liqs[t];
  let l2 = liqs[t+1];
  if (l1.trollbox_id == l2.trollbox_id)
  {
    l2.dupe = true;
    dupes++;
  }
}

if (dupes)
{
  console.log(`Whoops! Duplicates found: ${dupes}, aborting...`);
  process.exit(1);
}

// WRITE TO CSV
// this writes to stdout so if you want to save to a file
// run this script like this (I think this works on both *nix and Windows):
//
// node make-csv > your_csv_file_name.csv

console.log(`id,utc_datetime,timestamp,instrument,position,side,contracts,price`);
for (let l of liqs)
{
  let dt = (new Date(l.timestamp)).toISOString();
  console.log(`${l.trollbox_id},${dt},${l.timestamp},${l.instrument},${l.position},${l.side},${l.contracts},${l.price}`);
}




// CODE TO REMOVE DUPLICATES
// Older version of my code introduced duplicates so I had to fix
// them here

//
// let unduped = [];
// for (let l of liqs)
// {
//   if (!l.dupe)
//     unduped.push(l);
// }
//
// let tstart = unduped[0].timestamp;
// let tend = unduped[unduped.length-1].timestamp;
// let days = (tend - tstart) / (1000 * 60 * 60 * 24);
//
// console.log((new Date(tstart)).toISOString());
// console.log((new Date(tend)).toISOString());
// console.log(days<<0);
// console.log(`Org = ${liqs.length}`);
// console.log(`Dupes = ${dupes}`);
// console.log(`Clean = ${unduped.length}`);
// console.log(`Av/day = ${unduped.length / days}`);
//
// let mgr2 = new LiqManager('./db/mexliq-deduped.db');
// let ctr = 0;
// for (let l of unduped)
// {
//   l.id = l.trollbox_id;
//   try {
//     mgr2.add(l);
//   } catch (e) {
//     console.log(e);
//     console.log(ctr);
//     console.log(l);
//     break;
//   }
//   ctr++;
// }
