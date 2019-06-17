
// https://www.bitmex.com/api/v1/chat?count=500&reverse=false&channelID=1&start=4000000

// -------------
// bitmex-api-liquidations.js
// -------------
// hacky adaptation of my bitmex-api.js script for retrieving candle data
//

const URL = 'https://www.bitmex.com/api/v1';
const VERB = 'chat';

const BITMEX_API_DELAY = 2500;  // ms to wait between requests, don't spam the server or you'll get banned
const BITMEX_PAGE_SIZE = 500;   // BitMEX's maximum number of records per request
const CHANNEL_ID = 1;           // which trollbox (1 = English)

const LOGGING = true;           // er unused

const fetch = require('node-fetch');
const fs = require('fs');


// Get historical data from Bitmex in the given id range
// data_callback gets executed per data page
exports.chat = async function(start_id, end_id, data_callback)
{

  let total_messages = (end_id - start_id) + 1;

  // BitMEX api limits the amount of data returned in a single request into 'pages'
  // Calculate how many pages we need based on the IDs supplied
  let remainder = total_messages % BITMEX_PAGE_SIZE;
  let num_pages = (total_messages - remainder) / BITMEX_PAGE_SIZE;
  if (remainder) num_pages++;

  let urls = [];

  // Now generate a list of urls to call in sequence
  for (let p=0; p<num_pages; p++)
  {
    let start = (p * BITMEX_PAGE_SIZE) + start_id;
    // let url = `${URL}/${VERB}?binSize=${bin_size}&partial=true&symbol=${BITMEX_SYMBOL}&start=${start}&count=${BITMEX_PAGE_SIZE}&reverse=false&startTime=${start_time_iso}&endTime=${end_time_iso}`;

    let url = `${URL}/${VERB}?count=${BITMEX_PAGE_SIZE}&reverse=false&channelID=${CHANNEL_ID}`;
    urls.push(url);
  }

  // Uncomment to see what we're dealing with here:
  // console.log(urls)

  // Make the requests sequentially
  // almost 99.9% of the entire script's runtime will be spent in here:
  let res = await process_requests(urls, data_callback, start_id, end_id);

  return res;
}


async function process_requests(urls, data_callback, start_id, end_id)
{
  let data = [];
  let cur_start = start_id;

  // Iterate through the list of URLs we generated:
  for (let t=0; t<urls.length; t++)
  {

    // Why do I do this? see note below
    let u = `${urls[t]}&start=${cur_start}`;

    log(`Requesting => ${u}`);

    let from_rest = await get_data(u);

    // did user supply a callback?
    if (data_callback)
      data_callback(from_rest)


    // This is a MASSIVE time saver.
    // Basically, the trollbox ids are not 'complete' in that huge swathes are
    // missing or allocated elsewhere. Thus, our sequentially generated URL list
    // from earlier based on ID + BITMEX_PAGE_SIZE will often end up receiving
    // the same chat messages more than once leading to many duplicates
    //
    // So here we find the highest ID we received from the current page
    // and then adjust the start id of the *next* page to begin one after that
    cur_start = from_rest[from_rest.length-1].id + 1;

    if (cur_start > end_id) break;

    // Sleep for a while otherwise BitMEX will temporarily ban you (read their API docs)
    if (t < (urls.length-1))
    {
      log(`Waiting ${BITMEX_API_DELAY} ms...`);
      await delay();
    }

  }

  // a week later (lol) all done!
  return;
}

// Make the actual call here
const get_data = async url => {

    const response = await fetch(url);

    // Just report the current rate limit we have
    if (response.headers.has('x-ratelimit-limit'))
    {
      let rem = response.headers.get('x-ratelimit-remaining');
      console.log(`[limit = ${response.headers.get('x-ratelimit-limit')}, remain = ${rem}]`);
    }

    const data = await response.json();

    return data;
};

// Helper function, let's not overload mex and get our ass timeed-out
function delay()
{
  return new Promise(resolve => setTimeout(resolve, BITMEX_API_DELAY));
}

function log(text)
{
  if (LOGGING) console.log(text);
}


// this is just dead code from my other candle api

// // Takes array-of-arrays (Mex pages) and turns into single array.
// // formats candles as an array of elements [time, open, high....]
// function reformat_to_db_objects(exch, bin_size, pages)
// {
//   let candles = [];
//
//   for (let p of pages)
//   {
//     // for each candle in this page
//     for (let c of p)
//     {
//       //HACK: fix weird mex off-by-one error in their candle times
//         // note this offbyone applies to all time intervals/buckets
//         // so if requesting 15m candles, offset the time by -15 minutes.
//         // here, it's by 1 hour for 1h candles
//
//       candles.push({
//         exchange: exch,
//         interval: bin_size,
//         timestamp: (new Date(Date.parse(c.timestamp))).getTime() - MS_1HOUR,
//         open: c.open,
//         high: c.high,
//         low: c.low,
//         close: c.close,
//         symbol: DB_SYMBOL
//       });
//
//       //   [exch, bin_size,(new Date(Date.parse(c.timestamp))).getTime() - MS_1HOUR,
//       //   c.open, c.high, c.low, c.close
//       // ]
//
//     }
//   }
//
//  return candles;
//
// }
