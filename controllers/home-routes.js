const router = require("express").Router();
const sequelize = require("../config/connection");
const { Post, User, Comment, Likes } = require("../models");

router.get("/", (req, res) => {
  console.log(req.session);

  Post.findAll({
    attributes: [
      "id",
      "post_content",
      "title",
      "event_date",
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM likes WHERE post.id = likes.post_id)"
        ),
        "likes_count",
      ],
    ],
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      const posts = dbPostData.map((post) => post.get({ plain: true }));
      res.render("homepage", {
        posts,
        loggedIn: req.session.loggedIn,
        isOwner: req.session.isOwner,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
    return;
  }

  res.render("login");
});

router.get("/post/:id", (req, res) => {
  Post.findOne({
    where: { id: req.params.id },
    attributes: [
      "id",
      "post_content",
      "title",
      "event_date",
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM likes WHERE post.id = likes.post_id)"
        ),
        "likes_count",
      ],
    ],
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
      {
        model: Likes
      }
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }

      const post = dbPostData.get({ plain: true });
      const isGoing = post.likes.some(like => like.user_id == req.session.user_id);
      res.render("single-post", {
        post,
        loggedIn: req.session.loggedIn,
        isOwner: req.session.isOwner,
        isGoing
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
