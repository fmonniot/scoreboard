/**
 * UserController
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

  /**
   * `rest`
   *
   * REST blueprints are the automatically generated routes Sails uses to expose
   * a conventional REST API on top of a controller's `find`, `create`, `update`, and `destroy`
   * actions.
   *
   * For example, a BoatController with `rest` enabled generates the following routes:
   * :::::::::::::::::::::::::::::::::::::::::::::::::::::::
   * GET      /boat/:id?      -> BoatController.find
   * POST     /boat           -> BoatController.create
   * PUT      /boat/:id       -> BoatController.update
   * DELETE   /boat/:id       -> BoatController.destroy
   *
   * `rest` blueprints are enabled by default, and suitable for a production scenario.
   */

  search: function(req, res){

    User.find().where(req.body).
      exec(function(err, users){
        res.send(users);
      })
  }
  
};
