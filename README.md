
==========
How to use
==========

liqhist.js  -- main script you wanna run
make-csv.js -- outputs a csv from the database


Installation (note: needs to compile sqlite3 might need Xcode on macOS -- not sure, and definitely not sure about Windows sorry!):

npm install

or 'yarn' if you have that

Open liqhist.js and set: start_id = [whatever, zero if you're starting from scratch obviously]
and the end_id

run this script:

node liqhist <start_id, optional, for resuming>

# IMPORTANT Note

you need to set the `end_id` in the code to the most recent chat id
(details in liqhist.js). I should just grab this automatically with a get
request but I cba lol you do it
