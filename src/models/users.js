import db from './db.js'
import bcrypt from 'bcrypt';

const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4)) 
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, default_role];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;

    const queryParams = [email];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (isMatch) {
        delete user.password_hash;
        return user;
    }

    return null;
};

const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name ASC
    `;

    const result = await db.query(query);
    return result.rows;
};

const getUserById = async (userId) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.role_id, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

const updateUser = async (userId, name, email, roleId) => {
    const query = `
        UPDATE users 
        SET name = $1, email = $2, role_id = $3 
        WHERE user_id = $4
    `;
    await db.query(query, [name, email, roleId, userId]);
};

const deleteUser = async (userId) => {
    const query = `DELETE FROM users WHERE user_id = $1`;
    await db.query(query, [userId]);
};

const getAllRoles = async () => {
    const query = `SELECT role_id, role_name FROM roles ORDER BY role_name ASC`;
    const result = await db.query(query);
    return result.rows;
};

export { createUser, authenticateUser, getAllUsers, getUserById, updateUser, deleteUser, getAllRoles };
