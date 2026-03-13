const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const validateEmail = (email) => emailPattern.test(email.trim());

const validateStrongPassword = (password) => strongPasswordPattern.test(password);

const validateRegisterForm = ({ name, email, password, confirmPassword }) => {
    if (!name.trim()) {
        return 'Full name is required';
    }

    if (!validateEmail(email)) {
        return 'Enter a valid email address';
    }

    if (!validateStrongPassword(password)) {
        return 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol';
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return '';
};

const validateLoginForm = ({ email, password }) => {
    if (!validateEmail(email)) {
        return 'Enter a valid email address';
    }

    if (!password) {
        return 'Password is required';
    }

    return '';
};

const validateProjectForm = ({ title, description }) => {
    if (!title.trim()) {
        return 'Project title is required';
    }

    if (!description.trim()) {
        return 'Project description is required';
    }

    return '';
};

const validateTaskForm = ({ title, description, status, priority }) => {
    if (!title.trim()) {
        return 'Task title is required';
    }

    if (!description.trim()) {
        return 'Task description is required';
    }

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
        return 'Task status is invalid';
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
        return 'Task priority is invalid';
    }

    return '';
};

export {
    validateEmail,
    validateLoginForm,
    validateProjectForm,
    validateRegisterForm,
    validateStrongPassword,
    validateTaskForm,
};
