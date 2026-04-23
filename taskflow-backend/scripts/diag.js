const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../src/models/User');
const Project = require('../src/models/Project');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email role');
        const projects = await Project.find({}).populate('createdBy', 'name').populate('members', 'name');

        console.log(JSON.stringify({
            users: users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })),
            projects: projects.map(p => ({
                id: p._id,
                title: p.title,
                owner: p.createdBy?.name,
                members: p.members.map(m => m.name)
            }))
        }, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
