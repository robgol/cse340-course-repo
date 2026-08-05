import bcrypt from 'bcrypt';
import { 
    createUser, 
    authenticateUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    getAllRoles 
} from '../models/users.js';
import { getVolunteeredProjects, getFavoriteProjects } from '../models/projects.js';

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the user in the database
        const userId = await createUser(name, email, passwordHash);

        // Redirect to the home page after successful registration
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authenticateUser(email, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');
            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }
            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

const showDashboard = async (req, res) => {
    try {
        const user = req.session.user;
        const volunteeredProjects = await getVolunteeredProjects(user.user_id);
        const favoriteProjects = await getFavoriteProjects(user.user_id);
        
        res.render('dashboard', { 
            title: 'Dashboard',
            name: user.name,
            email: user.email,
            role: user.role_name,
            volunteeredProjects: volunteeredProjects,
            favoriteProjects: favoriteProjects
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'An error occurred while loading your dashboard.');
        res.redirect('/');
    }
};

const showUsersPage = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.render('users', {
            title: 'User Management',
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        req.flash('error', 'An error occurred while fetching users.');
        res.redirect('/dashboard');
    }
};

const showEditUserForm = async (req, res) => {
    try {
        const userId = req.params.id;
        const userToEdit = await getUserById(userId);
        const roles = await getAllRoles();

        if (!userToEdit) {
            req.flash('error', 'User not found.');
            return res.redirect('/users');
        }

        res.render('edit-user', {
            title: 'Edit User',
            userToEdit: userToEdit,
            roles: roles
        });
    } catch (error) {
        console.error('Error loading edit user form:', error);
        req.flash('error', 'An error occurred while loading the edit form.');
        res.redirect('/users');
    }
};

const processUpdateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, role_id } = req.body;

        await updateUser(userId, name, email, role_id);
        
        // If the user updated their own profile, update session
        if (req.session.user.user_id == userId) {
            const updatedUser = await getUserById(userId);
            req.session.user = updatedUser;
        }

        req.flash('success', 'User updated successfully.');
        res.redirect('/users');
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error', 'An error occurred while updating the user.');
        res.redirect(`/edit-user/${req.params.id}`);
    }
};

const processDeleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (req.session.user.user_id == userId) {
            req.flash('error', 'You cannot delete your own account from the management page.');
            return res.redirect('/users');
        }

        await deleteUser(userId);
        req.flash('success', 'User deleted successfully.');
        res.redirect('/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'An error occurred while deleting the user.');
        res.redirect('/users');
    }
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * 
 * @param {string} role - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (role) => {
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }
        // Check if user's role matches the required role
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/dashboard');
        }
        // User has required role, continue
        next();
    };
};

export { 
    showUserRegistrationForm, 
    processUserRegistrationForm, 
    showLoginForm, 
    processLoginForm, 
    processLogout,
    requireLogin,
    showDashboard,
    requireRole,
    showUsersPage,
    showEditUserForm,
    processUpdateUser,
    processDeleteUser
};
