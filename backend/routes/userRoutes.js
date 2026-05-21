import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { isAuth, isAdmin, generateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const userRouter = express.Router();
const BCRYPT_ROUNDS = 10;

const sendUserResponse = (res, user) => {
  res.send({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    token: generateToken(user),
  });
};

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (_req, res) => {
    const users = await User.find({}).select('-password');
    res.send(users);
  })
);

userRouter.get(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }
    sendUserResponse(res, user);
  })
);

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).send({ message: 'Invalid email or password' });
      return;
    }

    sendUserResponse(res, user);
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).send({ message: 'Name, email, and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).send({ message: 'User already exists' });
      return;
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: bcrypt.hashSync(password, BCRYPT_ROUNDS),
      role: 'customer',
    });

    const createdUser = await user.save();
    sendUserResponse(res, createdUser);
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }

    if (req.body.name) {
      user.name = req.body.name.trim();
    }
    if (req.body.email) {
      user.email = req.body.email.toLowerCase().trim();
    }
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, BCRYPT_ROUNDS);
    }

    const updatedUser = await user.save();
    sendUserResponse(res, updatedUser);
  })
);

export default userRouter;
