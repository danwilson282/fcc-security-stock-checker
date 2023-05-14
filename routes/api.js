'use strict';
let mongoose=require('mongoose');

const stockSchema = new mongoose.Schema({
  stockName: {type: String, required: true},
  likes: {type: [String], default: []}
});
let Stock = mongoose.model('stock', stockSchema)

const retrieveStock = async (code)=> {
    let url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+code+'/quote'
    const getData = await fetch(url);
    const data = await getData.json();
    const retval = {
          stock: data.symbol,
          price: data.latestPrice
        }
    if (!data.symbol || !data.latestPrice){
      return {error: 'Stock not found'}
    }
    else{
      return retval
    }
}
const likeDB = async (name,ip, like)=>{
  let checkStock = await Stock.findOne({stockName: name.stock})
  //if stock does not exist
  
  if (!checkStock){
      let newStock = new Stock({
        stockName: name,
        likes: []
    })
    await newStock.save()
    checkStock = await Stock.findOne({stockName: name})
  }
  //if true flag
  if (like=='true'){
    //if unique add to db
    if (!checkStock.likes.includes(ip)){
      checkStock.likes.push(ip)
      await checkStock.save()
    }
  }

  
  return checkStock.likes.length
  
}


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const ip = req.ip;
      let like = req.query.like
      //if (like=='true'){
      //  console.log('liked')
      //}
      let code = req.query.stock
      //if single string
      let stk = ''
      let likes = 0
      if (typeof(code)=='string'){
        stk = await retrieveStock(code)
        if (stk.error){
          return stk
        }
        else{
          likes = await likeDB(stk, ip, like)
          stk.likes = likes
        }    
      }
      //if more than one
      else{
        stk = []
        let temp = ''
        for (let i=0;i<2;i++){
          temp = await retrieveStock(code[i])
          if (temp.error){
            return temp
          }
          else{
            likes = await likeDB(temp, ip, like)
            temp.likes = likes
          } 
          //get likes
          stk.push(temp)
        }
        //get relative likes
        stk[0].rel_likes = stk[0].likes - stk[1].likes
        stk[1].rel_likes = stk[1].likes - stk[0].likes
        delete stk[0].likes
        delete stk[1].likes
      }
      //if like true
      
      res.json({stockData: stk})
    });
    
};
