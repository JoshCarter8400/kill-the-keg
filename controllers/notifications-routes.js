const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment, Mention } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, (req, res) => {
  Mention.findAll({
    where: { user_id: req.session.user_id },
    include: [
      {
        model: Comment,
        attributes: ['comment_text', 'created_at'],
        include: [
          {
            model: User,
            attributes: ['username']
          },
          {
            model: Post,
            attributes: ['id', 'title', 'created_at'],
            include: {
              model: User,
              attributes: ['username']
            }
          }
        ]
      }
    ],
  })
    .then((dbMentionData) => {
      const mentions = dbMentionData.map((mention) => mention.get({ plain: true }));
      res.render('notifications', { mentions, loggedIn: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;