import mongoose from 'mongoose';
import User from './models/User.js';
import Customer from './models/customer.js';
import { connectDB } from './db/connect.js';

async function run() {
  await connectDB();
  const email = 'customer@motd.test';
  
  const user = await User.findOne({ email });
  if (user) {
    user.name = 'Customer';
    await user.save();
    console.log('Successfully updated User name to "Customer"');
  } else {
    console.log('User not found.');
  }

  if (user) {
    const customer = await Customer.findOne({ userId: user._id });
    if (customer) {
      customer.name = 'Customer';
      await customer.save();
      console.log('Successfully updated Customer profile name to "Customer"');
    } else {
      console.log('Customer profile not found.');
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch(console.error);
