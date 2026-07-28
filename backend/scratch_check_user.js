import mongoose from 'mongoose';
import { env } from './config/env.js';
import User from './models/User.js';

async function check() {
  await mongoose.connect(env.mongodbUri);
  console.log('Connected to DB');
  const user = await User.findOne({ email: 'customer@motd.test' });
  if (user) {
    console.log('User found:', user.toJSON());
  } else {
    console.log('User not found');
  }
  await mongoose.disconnect();
}

check().catch(console.error);
