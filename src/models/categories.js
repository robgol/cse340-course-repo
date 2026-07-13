import db from './db.js'

const getAllCategories = async () => {
    const query = 'SELECT category_id, name, icon, color, image_url FROM categories ORDER BY name ASC';
    const result = await db.query(query);
    return result.rows;
}

export { getAllCategories }
