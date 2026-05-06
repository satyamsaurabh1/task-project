const User = require('../models/User');
const { USER_ROLES } = require('./constants');

const bootstrapRootAdmin = async () => {
    const rootEmail = process.env.ROOT_ADMIN_EMAIL?.trim().toLowerCase();
    const rootPassword = process.env.ROOT_ADMIN_PASSWORD?.trim();
    const rootName = process.env.ROOT_ADMIN_NAME?.trim() || 'TaskFlow Root Admin';

    if (!rootEmail || !rootPassword) {
        console.log('[BOOTSTRAP] Root admin bootstrap skipped. Set ROOT_ADMIN_EMAIL and ROOT_ADMIN_PASSWORD to enable it.');
        return null;
    }

    const existingUser = await User.findOne({ email: rootEmail }).select('+password');

    if (!existingUser) {
        const createdUser = await User.create({
            name: rootName,
            email: rootEmail,
            password: rootPassword,
            role: USER_ROLES.ADMIN
        });

        console.log(`[BOOTSTRAP] Root admin created for ${rootEmail}`);
        return createdUser;
    }

    existingUser.name = rootName;
    existingUser.role = USER_ROLES.ADMIN;
    existingUser.password = rootPassword;
    await existingUser.save();

    console.log(`[BOOTSTRAP] Root admin synced for ${rootEmail}`);
    return existingUser;
};

module.exports = bootstrapRootAdmin;
