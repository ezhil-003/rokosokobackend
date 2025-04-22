import { User } from '../models/userSchema.js';
import { ok, err } from 'neverthrow';


// getUsers Controller
export const getUsers = async (req, res) => {
  try {
    const { ids } = req.query;

    const filter = ids ? { _id: { $in: ids.split(',') } } : {};
    const users = await User.find(filter);

    if (!users.length) {
      const message = ids
        ? 'No users found for the provided IDs.'
        : 'No users found in the database.';
      return res.status(404).json(err(new Error(message)));
    }

    return res.status(200).json(ok({ message: 'Users fetched successfully', users }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json(err(new Error('Server error while fetching users.')));
  }
};


//editUser Controller
export const editUser = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    if (!ids || !updateData || typeof updateData !== 'object') {
      return res.status(400).json(err(new Error('Missing or invalid request data.')));
    }

    const validStatuses = ['active', 'Deactivated', 'Suspended', 'inactive'];

    if ('status' in updateData && !validStatuses.includes(updateData.status)) {
      return res.status(400).json(err(new Error('Invalid status value.')));
    }

    if ('roles' in updateData && !Array.isArray(updateData.roles)) {
      return res.status(400).json(err(new Error('Roles should be an array.')));
    }

    const filter = Array.isArray(ids)
      ? { _id: { $in: ids } }
      : { _id: ids };

    const { modifiedCount } = await User.updateMany(filter, updateData);

    if (modifiedCount === 0) {
      return res.status(404).json(err(new Error('No users were updated.')));
    }

    return res.status(200).json(ok({ message: 'User(s) updated successfully', modifiedCount }));
  } catch (error) {
    console.error('Error editing user(s):', error);
    return res.status(500).json(err(new Error('Server error while updating user(s).')));
  }
};

// deleteUser Controller
export const deleteUser = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json(err(new Error('No user IDs provided.')));
    }

    const filter = Array.isArray(ids)
      ? { _id: { $in: ids } }
      : { _id: ids };

    const { deletedCount } = await User.deleteMany(filter);

    if (deletedCount === 0) {
      return res.status(404).json(err(new Error('No users were deleted.')));
    }

    return res.status(200).json(ok({ message: 'User(s) deleted successfully', deletedCount }));
  } catch (error) {
    console.error('Error deleting user(s):', error);
    return res.status(500).json(err(new Error('Server error while deleting user(s).')));
  }
};