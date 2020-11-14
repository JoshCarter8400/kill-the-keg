const User = require("./user");
const Post = require("./post");
const Comment = require("./comment");
const Mention = require("./mention");
const Likes = require("./likes");

// Associations

User.hasMany(Post, {
  foreignKey: "user_id",
});

Post.belongsTo(User, {
  foreignKey: "user_id",
});

User.belongsToMany(Post, {
  through: Likes,
  as: "liked_posts",
  foreignKey: "user_id",
});

Post.belongsToMany(User, {
  through: Likes,
  as: "liked_posts",
  foreignKey: "post_id",
});

Likes.belongsTo(User, {
  foreignKey: "user_id",
});

Likes.belongsTo(Post, {
  foreignKey: "post_id",
});

User.hasMany(Likes, {
  foreignKey: "user_id",
});

Post.hasMany(Likes, {
  foreignKey: "post_id",
});

Comment.belongsTo(User, {
  foreignKey: "user_id",
});

Comment.belongsTo(Post, {
  foreignKey: "post_id",
});

User.hasMany(Comment, {
  foreignKey: "user_id",
});

Post.hasMany(Comment, {
  foreignKey: "post_id",
});

module.exports = { User, Post, Likes, Comment };
