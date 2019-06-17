

//
// liqhist.js -- main script for retrieving BitMEX liquidation histories
//               for all instruments. Enjoy!
//               @treypeng

// HOW TO RUN:
//    node liqhist <optional_start_id>
//
// that's it!

//
// example chat message and regex:
//    let liq = "Liquidated long on `XBTUSD`: sell 10050 @ 6211".toLowerCase();
//    let re = /liquidated\s(long|short)\son\s`([^`]+)`:\s(buy|sell)\s(\d*\.?\d*)\s@\s(\d*\.?\d*)/g;
//    let match = re.exec(liq);
//    console.log(match);


const M_POSITION = 2, M_INSTR = 3, M_SIDE = 4, M_NUMCONTR = 5, M_PRICE = 6;

const Bitmex = require('./bitmex-api-liquidations.js');   // bitmex api helper
let LiqManager = require('./liq-db-mgr.js');              // sqlite helper
let mgr = new LiqManager('./db/mexliq-new.db');


// start_id; overrideable as a cmdline parameter
// let start_id = 29650000;// 28916848+1;
let start_id = 0;


// ************************************************************************
// ************************************************************************
// NOTE: YOU NEED TO UPDATE THIS NUMBER HERE TO GET THE LATEST ID !!!!!!!
// ************************************************************************
// ************************************************************************


let end_id = 34739309; // <-- CORRECT AS OF 17th June 2019


// end_id use this url: https://www.bitmex.com/api/v1/chat?count=1&reverse=true&channelID=1
// to get the latest chat message id. maybe modify this script to call the above automatically?
// Note that you may have to run this script *again* after it completes because
// of the frequency of chat messages and how long this script takes to finish.



// example: `node liqhist 123456789`
if (process.argv[2])
{
  start_id = Number(process.argv[2])
  console.log(`(re)starting with id=${start_id}`);
}


// Asynchronous NodeJS function so we can iteratively call REST verbs
async function acquire(from, to)
{
    // Download a batch of trollbox messages...
    let messages = await  Bitmex.chat(from, to, messages => {

    let added = 0;

    // Iterate through the msgs
    for (let msg of messages)
    {
      // Here's our liquidation bot!
      if (msg.user == 'REKT')
      {
        let liq = msg.message.toLowerCase();
        let re = /(liquidated)\s(long|short)\son\s`([^`]+)`:\s(buy|sell)\s(\d*\.?\d*)\s@\s(\d*\.?\d*)/g;
        let match = re.exec(liq);

        if (match)
        {
          let obj =
          {
            id: Number(msg.id),
            timestamp: (new Date(Date.parse(msg.date))).getTime(),
            instrument: match[M_INSTR],
            position: match[M_POSITION],
            side: match[M_SIDE],
            contracts: Number(match[M_NUMCONTR]),
            price: Number(match[M_PRICE])
          };

          // Call the SQLite3 manager and insert the data
          mgr.add(obj);

          added++;

        } else {

          // Typically this will output funny messages from the REKT bot
          // you'll see what I mean when you run it lol
          console.log(`*** Unrecognised: ${msg.message}`);
        }

      }
    }

    if (added)
      console.log(`* Added ${added} liquidation entries`);

    return;
  });

}


// Begin executing here:

acquire(start_id, end_id)
.then(() => {
  console.log('Finished.')
})
.catch( err => {
  console.log( err );
});
