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

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          date
        FROM service_projects
        WHERE organization_id = $1
        ORDER BY date;
      `;

    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);
    return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
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
        JOIN organizations o ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date ASC
        LIMIT $1;
    `;
    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

const getProjectDetails = async (id) => {
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
        JOIN organizations o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

// Export the model functions
export { getAllProjects, getProjectsByOrganizationId, getUpcomingProjects, getProjectDetails };
