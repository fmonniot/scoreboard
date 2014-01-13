/**
 * Created by francois on 10/01/14.
 */

// Use the socket.io room system to manage board event
module.exports = {
  withSocket: function(socket) {
    this.socket = socket;
    return this;
  },
  inBoard: function(boardId){
    this.boardId = boardId;
    return this;
  },

  // Function to subscribe the notification of this board
  subscribeTo: function(boardId){
    this.socket.join('board-'+boardId);
  },
  revokeSubscribtion: function(boardId){
    this.socket.leave('board-'+boardId);
  },

  // Real helpers
  publishNewScore: function(score){
    sails.io.sockets.in('board-'+this.boardId).emit('message', {uri: 'score/new', score:score});
  },
  publishUserJoin: function(user){
    sails.io.sockets.in('board-'+this.boardId).emit('message', {uri: 'user/join', user:user});
  },
  publishUserLeave: function(user){
    sails.io.sockets.in('board-'+this.boardId).emit('message', {uri: 'user/leave', user:user});
  }
};