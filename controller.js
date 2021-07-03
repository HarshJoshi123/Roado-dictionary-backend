const http = require("https");
const dotenv=require('dotenv');
dotenv.config();

const app_id=process.env.APPID;
const app_key=process.env.APPKEY;
const fields = "definitions";
const strictMatch = "false";




exports.fetchFromApi=(word,db,res)=>{
const options = {
  host: 'od-api.oxforddictionaries.com',
  port: '443',
  path: '/api/v2/entries/en-us/' + word,
  method: "GET",
  headers: {
    'app_id': app_id,
    'app_key': app_key
  }
};

http.get(options, (resp) => {
    //let body = '';
    let body = "";
  let parsed = {};
    resp.on('data', (d) => {
        body += d;
    });
    resp.on('end', () => {
        //console.log(body);
        //let parsed = body;
      //  let parsed={}; 
          if(body.error){
            throw new Error('no results found')
          }
         console.log(body);
          body=JSON.parse(body);
        const {results} = body;
         
         //results=JSON.parse(results);
          parsed.id = body.id;
          parsed.word = body.word;
          parsed.senses = [];
          parsed.synonyms = [];
   
          if(results)
            for(let i=0; i<results.length; i++) {
              if(results[i].lexicalEntries)
                for(let j=0; j<results[i].lexicalEntries.length; j++) {
                  if(results[i].lexicalEntries[j].entries)
                    for(let k=0; k<results[i].lexicalEntries[j].entries.length; k++) {
                      if(results[i].lexicalEntries[j].entries[k].pronunciations)
                        for(let p=0; p<results[i].lexicalEntries[j].entries[k].pronunciations.length; p++){
                          if(!parsed.pronunciation)
                            try{parsed.pronunciation = results[i].lexicalEntries[j].entries[k].pronunciations[p].audioFile}catch(e){console.log('Pronunciation: ',e.message)}
                        }
                      if(results[i].lexicalEntries[j].entries[k].senses)
                        for(let l=0; l<results[i].lexicalEntries[j].entries[k].senses.length; l++) {
                          let sense = {};
                          sense.examples = [];
                          try{sense.definition = results[i].lexicalEntries[j].entries[k].senses[l].definitions[0]}catch(e){console.log('Definition: ', e.message)}
                          if(results[i].lexicalEntries[j].entries[k].senses[l].examples)
                            for(let m=0; m<results[i].lexicalEntries[j].entries[k].senses[l].examples.length; m++){
                              try{sense.examples.push(results[i].lexicalEntries[j].entries[k].senses[l].examples[m].text)}catch(e){console.log('Examples: ', e.message)}
                            }
                          parsed.senses.push(sense);
                          if(results[i].lexicalEntries[j].entries[k].senses[l].synonyms)
                            for(let n=0; n<results[i].lexicalEntries[j].entries[k].senses[l].synonyms.length; n++){
                              try{parsed.synonyms.push(results[i].lexicalEntries[j].entries[k].senses[l].synonyms[n].text)}catch(e){'Synonyms: ', console.log(e.message)}
                            }
                        }
                    }
                }
            }
console.log(parsed);
 if(parsed.id==undefined){
  return res.status(400).json({err:"id null"});
 }
    db.collection("words").insertOne(parsed, (err, result) => {
        if (err) {
          console.log("error in saving");
        } else {
          console.log("send response after fetching ");

          return res.json({
            msg:"Word successfully added!!"
          });
        } //else
        //db collection
      });

        
    });
})

}

