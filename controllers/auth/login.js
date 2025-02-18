const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'Invalid credentials. User not found.' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Create a new user object without the _id and password
    const userinfo = { ...user.toObject() }; // Convert to plain object
    delete userinfo._id;  // Remove _id
    delete userinfo.password; // Remove password

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, userinfo });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(200).json({ message: 'Server Error during login. Please try again later.' });
  }
};
