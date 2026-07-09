import db from './db.js'

const getAllProjects = async() => {
    const query = `
        SELECT 
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            p.image_url,
            o.name AS organization_name
        FROM service_projects p
        JOIN organizations o ON p.organization_id = o.organization_id;
    `;
    const result = await db.query(query);
    return result.rows;
}

export { getAllProjects }
