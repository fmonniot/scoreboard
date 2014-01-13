/**
 * ScoreController
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

  // TODO implements actions with support for socket.io (emit event for board)
  create: function(req,res){
    Score.create(req.body, function(err, score){
      if(err){
        console.log(err);
        res.send(500);
      }
      BoardSocketHelper.withSocket(req.socket).publishNewScore(score);
      res.send(200);
    })
  }
};
