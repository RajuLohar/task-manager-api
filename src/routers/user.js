const express = require("express");
const sharp=require('sharp')
const multer = require("multer");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();
const {sendWelcomeEmail,sendCancelationEmail}=require('../emails/account')

//To create new User
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//For login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

//To logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//To Logout all
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//To show all users
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//To update user
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//To delete user
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email,req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

//to upload an image 
router.post("/users/me/avatar",auth,upload.single("avatar"), async (req, res) => {
  const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
  req.user.avatar=buffer
  await req.user.save()  
  res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);


//to delete the image
router.delete("/users/me/avatar",auth, async (req, res) => {
  req.user.avatar=undefined
  await req.user.save()  
  res.send();
  });


router.get('/users/:id/avatar',async (req,res)=>{
  try{
    const user=await User.findById(req.params.id)
    if(!user || !user.avatar){
      throw new Error()
    }
    res,set('Content-Type','image/jpg')
    res.send(user.avatar  )

  }catch(e){
    res.status(404).send()
  }
})

module.exports = router;
