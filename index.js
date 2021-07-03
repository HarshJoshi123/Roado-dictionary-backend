const express=require('express');
const app=express();
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const mongo=require('mongodb').MongoClient;
const fetch = require("node-fetch");
const Routes=require('./Routes.js');
const cors=require('cors')
const {fetchFromApi}=require('./controller.js');
dotenv.config();
const URI=process.env.URI;
const PORT=process.env.PORT || 8080;
app.use(cors());
mongo.connect(
  URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    const db = client.db("dictionary");
    app.use(express.json()); //Deal with incoming request as object and recognizes it as Json which is readable by nodejs
    //app.use(express.urlencoded({extended:false}));
     //app.use('/',Routes);
   
  app.get("/",(req,res)=>{
    console.log("/ called");
    var wr=[];
    client
        .db("dictionary")
        .collection("words").find().toArray((err,words)=>{
           // console.log(words);
           //  wr=words;
           if(err){

           }
           else{
           //console.log(words);
          res.status(200).send(words);
         }
        })
       // res.json({words});
  })
  
console.log("mongo client working");
    app.post("/word",(req, res) => {
      console.log("post req called");
      //console.log(req.body);
      if(req.body==null||req.body.word==null||req.body.word==""){
        console.log("null value ")
        return res.status(401).json({err:"you sent null value"})
      }
      client
        .db("dictionary")
        .collection("words")
        .find()
        .toArray((err, words) => {
          if(err){
          	console.log("error");
          	console.log(err);
          	return ;
          }
          //console.log(words);
          var flag=false;
          for (var i = 0; i < words.length; i++) {
           if(words[i].id==req.body.word){
   return res.status(400).json({error:"word already present"});
           console.log("word present");
           flag=true;
           }
          
          }
          if (flag==false) {
           console.log("word not present");
            console.log(req.body.word);
            fetchFromApi(req.body.word, db, res);
          }
        });

      //find in collection
    });
  }
);

app.listen(PORT,()=>{
	console.log(`listening at port ${PORT}`);

})