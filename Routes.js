const express=require('express');
const router=express.Router();
const {fetchFromApi}=require('./controller.js');


router.get('/search',fetchFromApi);
module.exports=router;