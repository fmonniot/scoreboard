/**
 * Created by francois on 16/01/14.
 */


// Bootstrap the Sails server
require('../support/bootstrap');
var request = require('supertest'),
    chai = require('chai'),
    expect = chai.expect;
chai.use(require('chai-fuzzy'));

describe('Board API', function () {

  var board, userId;
  before(function (done) {
    Board.create({name:'board', maxParticipants: 3}).done(function(err, b){
      board = b;
      User.create({name: 'user'}).done(function(err, user){
        userId = user.id;
        done();
      });
    });
  });


  describe('POST /api/board/:id/invite/:userId', function () {
    it('should add a user in the board', function (done) {
      request(global.app)
          .post('/api/board/'+board.id+'/invite/'+userId)
          .expect(200, function(){
            User.findOne({id: userId}).done(function(err, user){
              expect(user.boards).to.eql([board.id]);

              done();
            });
          });
    });
  });

  describe('POST /api/board/:id/expel/:userId', function () {
    it('should remove a user from the board', function (done) {
      request(global.app)
          .post('/api/board/'+board.id+'/expel/'+userId)
          .expect(200, function(){
            User.findOne({id: userId}).done(function(err, user){
              expect(user.boards).to.eql([]);

              done();
            });
          });
    });
  });

});