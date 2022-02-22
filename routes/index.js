  var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var {MongoClient} =require('mongodb')
var client =new MongoClient('YOUR MONGO KEY')
var ObjectId = require('mongodb').ObjectId;
class Bicycle{
  constructor(name, type, price,rent) {
    this.name = name;
    this.type =type;
    this.price = price;
    this.rent= rent;
  }

}

const start = async (req)=>{

    const bicycle = new Bicycle(req.body.name, req.body.type, req.body.price,req.body.rent)
    await  client.connect()
    console.log('connection on')
    console.log(req.body)
    const bicycles = client.db().collection('bicycles')
    console.log(bicycle)
    const result = await bicycles.insertOne({bicycle})
    return result.acknowledged
}

  const checkBicycles = async ()=>{
      await  client.connect()
      const bicycles = client.db().collection('bicycles')
      const bicyclesList =[];
      const bicycle = await bicycles.find().sort({$natural:-1}).limit(1);
      await bicycle.forEach((item)=>{
          if(item.bicycle!==null|| item.bicycle!==undefined){
              bicyclesList.push(item);
          }
      })
      return bicyclesList;
  }

/* GET home page. */

router.post('/tests',async (req, res, next)=>{
  const result = await start(req);

  if(result){
      res.sendStatus(201)
      next()
  }else{
      res.sendStatus(404)
  }

})





router.get('/getBicycles', async (req, res, next)=>  {
  const list = await  checkBicycles();
  console.log(list)
  res.json({list});

})




  const checkBicyclesRender = async ()=>{
      await  client.connect()
      const bicycles = client.db().collection('bicycles')
      const bicyclesList =[];
      const bicycle = await bicycles.find();
      await bicycle.forEach((item)=>{
          if(item.bicycle!==null|| item.bicycle!==undefined){
              bicyclesList.push(item);
          }
      })
      return bicyclesList;
  }




  router.get('/getBicyclesRender', async (req, res, next)=>  {
      const list = await  checkBicyclesRender();
      console.log(list)
      res.json({list});

  })




  const trueBicyclesRent = async (bicycleId)=>{
      await  client.connect()
      const bicycles = client.db().collection('bicycles')
      await bicycles.updateOne({"_id":new ObjectId(bicycleId)},{$set:{"bicycle.rent":true,"bicycle.date":`${Date.now()}`}});
      return await  getBicyclesRent(bicycleId);

  }
  const falseBicyclesRent = async (bicycleId)=>{
      await  client.connect()
      const bicycles = client.db().collection('bicycles')
      await bicycles.updateOne({"_id":new ObjectId(bicycleId)},{$set:{"bicycle.rent":false},$unset:{"bicycle.date":""}});
      return await  getBicyclesRent(bicycleId);

  }


  const getBicyclesRent = async (bicycleId)=>{
      await  client.connect()
      const bicycles = client.db().collection('bicycles')
      const newRent = await bicycles.findOne({"_id":new ObjectId(bicycleId)});
      console.log(newRent)
      return newRent;
  }


  router.post('/getRent', async (req, res, next)=>  {
    const result = await  trueBicyclesRent(req.body.id);
        res.json({result});
        next()


  })

  router.post('/cancelRent', async (req, res, next)=>  {
      const result = await  falseBicyclesRent(req.body.id);
      res.json({result});
      next()


  })

  const deleteBicycle = async (bicycleId)=>{

      await  client.connect()
      console.log('connection on')
      console.log(bicycleId)
      const bicycles = client.db().collection('bicycles')
      const deletedInfo = await bicycles.deleteOne({"_id":new ObjectId(bicycleId)})
      console.log(deletedInfo)
      let result = false
      if(deletedInfo.deletedCount===1){
          result = true
      }
      return result
  }



  router.delete('/:id',async (req, res, next)=>{
      const result =  await deleteBicycle(req.params.id);
      if(result){
          res.sendStatus(204)
      }else{
          console.log(result)
          res.sendStatus(400)
          next();
      }

  })
module.exports = router;
