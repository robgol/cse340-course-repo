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

const createProject = async (title, description, location, date, organizationId) => {
    const imageUrl = 'https://loremflickr.com/800/600/service,volunteer/all';
    const query = `
      INSERT INTO service_projects (title, description, location, date, organization_id, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING project_id;
    `;

    const queryParams = [title, description, location, date, organizationId, imageUrl];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
}

const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
      UPDATE service_projects
      SET title = $1, description = $2, location = $3, date = $4, organization_id = $5
      WHERE project_id = $6
      RETURNING project_id;
    `;

    const queryParams = [title, description, location, date, organizationId, projectId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated project with ID:', projectId);
    }

    return result.rows[0].project_id;
};

/**
 * Add a user as a volunteer for a project
 */
const volunteerForProject = async (projectId, userId) => {
    const query = `
        INSERT INTO volunteers (project_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (project_id, user_id) DO NOTHING
        RETURNING *;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows[0];
};

/**
 * Remove a user from volunteering for a project
 */
const removeVolunteer = async (projectId, userId) => {
    const query = `
        DELETE FROM volunteers
        WHERE project_id = $1 AND user_id = $2
        RETURNING *;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows[0];
};

/**
 * Get all projects a specific user has volunteered for
 */
const getVolunteeredProjects = async (userId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.date,
            p.image_url,
            o.name AS organization_name
        FROM service_projects p
        JOIN organizations o ON p.organization_id = o.organization_id
        JOIN volunteers v ON p.project_id = v.project_id
        WHERE v.user_id = $1
        ORDER BY p.date ASC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Check if a user is already volunteering for a project
 */
const isUserVolunteering = async (projectId, userId) => {
    const query = `
        SELECT 1 FROM volunteers
        WHERE project_id = $1 AND user_id = $2;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows.length > 0;
};

/**
 * Add a project to a user's favorites
 */
const addFavorite = async (projectId, userId) => {
    const query = `
        INSERT INTO favorites (project_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (project_id, user_id) DO NOTHING
        RETURNING *;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows[0];
};

/**
 * Remove a project from a user's favorites
 */
const removeFavorite = async (projectId, userId) => {
    const query = `
        DELETE FROM favorites
        WHERE project_id = $1 AND user_id = $2
        RETURNING *;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows[0];
};

/**
 * Get all projects a specific user has favorited
 */
const getFavoriteProjects = async (userId) => {
    const query = `
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.location,
            p.date,
            p.image_url,
            o.name AS organization_name
        FROM service_projects p
        JOIN organizations o ON p.organization_id = o.organization_id
        JOIN favorites f ON p.project_id = f.project_id
        WHERE f.user_id = $1
        ORDER BY p.date ASC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Check if a project is favorited by a user
 */
const isProjectFavorite = async (projectId, userId) => {
    const query = `
        SELECT 1 FROM favorites
        WHERE project_id = $1 AND user_id = $2;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows.length > 0;
};

// Export the model functions
export { 
    getAllProjects, 
    getProjectsByOrganizationId, 
    getUpcomingProjects, 
    getProjectDetails, 
    createProject, 
    updateProject,
    volunteerForProject,
    removeVolunteer,
    getVolunteeredProjects,
    isUserVolunteering,
    addFavorite,
    removeFavorite,
    getFavoriteProjects,
    isProjectFavorite
};
