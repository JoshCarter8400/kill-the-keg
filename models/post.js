const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Post extends Model {
  static async like(body, models) {
    const existingLike = await models.Likes.findOne({
      where: {
        user_id: body.user_id,
        post_id: body.post_id
      },
      attributes: ['id']
    });

    let result;

    if (existingLike) {
      result = await models.Likes.destroy({
        where: existingLike.get({ plain: true })
      });
    } else {
      result = await models.Likes.create({
        user_id: body.user_id,
        post_id: body.post_id
      });
    }

    return Post.findOne({
      where: {
        id: body.post_id
      },
      attributes: [
        'id',
        'title',
        'post_content',
        'event_date',
        [
          sequelize.literal('(SELECT COUNT(*) FROM likes WHERE post.id = likes.post_id)'),
          'likes_count'
        ]
      ]
    });
  }
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_content: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    event_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "post",
  }
);

module.exports = Post;
