import mongoose from 'mongoose';

const ROLES = ['customer', 'admin', 'seller', 'fabric_store', 'tailor', 'delivery'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ROLES,
      default: 'customer',
      required: true,
    },
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function syncAdminFlag(next) {
  this.isAdmin = this.role === 'admin';
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
export { ROLES };
