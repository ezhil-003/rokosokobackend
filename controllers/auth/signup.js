import bcrypt from 'bcrypt';
import { User } from '../../models/userSchema.js';

export const signup = async (req, res) => {
  try {
    const {
      username,
      email,
      mobile,
      password,
      aboutMe,
      gender,
      state,
      country,
      status,
      auth_provider
    } = req.body;

    console.log(req.body)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ message: 'User already exists. Please try with a different email.' });
    }

    const saltRounds = 10; // Or another number for the complexity of the salt
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      mobile,
      password: hashedPassword,
      aboutMe,
      gender,
      state,
      country,
      status: status || 'active',
      auth_provider,
    });

    await newUser.save();

    res.status(200).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(200).json({ message: 'Server Error. Please try again later.' });
  }
};
