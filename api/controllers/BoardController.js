/**
 * BoardController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  // TODO Add some business rules (ex: /board/:id/invit/:userId with board.maxParticipants limit)

  subscribe: function(req){
    BoardSocketHelper.withSocket(req.socket).subscribeTo(req.param('id'));
  },
  unsubscribe: function(req) {
    BoardSocketHelper.withSocket(req.socket).revokeSubscribtion(req.param('id'));
  },

  invite: function(req,res) {
    Board.findOne(req.param('id'), function(err, board){
      if(err) {
        console.log(err);
        res.send(404);
      }

      User.findOne(req.param('userId'), function(err, user){
        if(err) {
          console.log(err);
          res.send(404);
        }

        if(undefined === user.boards) {
          user.boards = [];
        }
        user.boards.push(board.id);
        user.save(function(err){
          if(err) {
            console.log(err);
            res.send(500);
          }

          BoardSocketHelper.withSocket(req.socket).inBoard(board.id).publishUserJoin(user);
          res.send(board);
        });
      });
    });
  },

  expel: function(req,res) {
    Board.findOne(req.param('id'), function(err, board){
      if(err) {
        console.log(err);
        res.send(404);
      }

      User.findOne(req.param('userId'), function(err, user){
        if(err) {
          console.log(err);
          res.send(404);
        }


        var index = user.boards.indexOf(board.id);

        if(index == -1){
          res.send(406);
        }
        user.boards.splice(index, 1);

        user.save(function(err){
          if(err) {
            console.log(err);
            res.send(500);
          }

          BoardSocketHelper.withSocket(req.socket).inBoard(board.id).publishUserLeave(user);
          res.send(board);
        });
      });
    });
  }
};
