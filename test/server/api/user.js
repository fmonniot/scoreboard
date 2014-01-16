/**
 * Created by francois on 16/01/14.
 */


// Bootstrap the Sails server
require('../support/bootstrap');
var request = require('supertest'),
    chai = require('chai'),
    expect = chai.expect;
chai.use(require('chai-fuzzy'));

describe('User API', function () {

  describe('POST /api/user/search', function () {

    var inBoard = [];
    before(function (done) {
      User.create({name:'test1', boards: [ "1234567890" ] }, function (err,u) {
        inBoard[0] = u;
        User.create({name:'test2', boards: [ "1234567890" ] }, function (err, u) {
          inBoard[1] = u;
          done();
        });
      });

    });

    it('should return users in a given board', function (done) {
      request(global.app)
          .post('/api/user/search')
          .send({ "boards": {"contains": "1234567890"}})
          .expect(200, function(err, res){
            expect(res.body).to.be.jsonOf(inBoard);
            done();
          });
    });

  });

});