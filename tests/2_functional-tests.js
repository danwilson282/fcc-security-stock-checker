const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let likes
suite('Functional Tests', function() {
    suite('One Stock...', function(){
        test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
              .get('/api/stock-prices/')
              .query({
                stock: 'gOOg'
              })
              .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.equal(res.body.stockData.stock, 'GOOG')
                  done();
              });
          });
          test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
              .get('/api/stock-prices/')
              .query({
                stock: 'gOOg',
                like: 'true'
              })
              .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.equal(res.body.stockData.stock, 'GOOG')
                  assert.isAtLeast(res.body.stockData.likes, 1)
                  likes = res.body.stockData.likes
                  done();
              });
          });
          test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
              .get('/api/stock-prices/')
              .query({
                stock: 'gOOg',
                like: 'true'
              })
              .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.equal(res.body.stockData.stock, 'GOOG')
                  assert.equal(res.body.stockData.likes, likes)
                  done();
              });
          });
    })
    suite('Two Stocks...', function(){
        test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
              .get('/api/stock-prices/')
              .query({
                stock: ['gOOg', 'msft']
              })
              .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.equal(res.body.stockData[0].stock, 'GOOG')
                  assert.equal(res.body.stockData[1].stock, 'MSFT')
                  done();
              });
          });
          test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
              .get('/api/stock-prices/')
              .query({
                stock: ['gOOg', 'msft'],
                like: 'true'
              })
              .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.equal(res.body.stockData[0].stock, 'GOOG')
                  assert.equal(res.body.stockData[1].stock, 'MSFT')
                  assert.isNumber(res.body.stockData[0].rel_likes)
                  assert.isNumber(res.body.stockData[1].rel_likes)
                  assert.equal((res.body.stockData[1].rel_likes)+(res.body.stockData[0].rel_likes), 0)
                  done();
              });
          });
    })
});
