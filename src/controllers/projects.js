// Import any needed model functions
import { body, validationResult } from 'express-validator';
import { 
    getUpcomingProjects, 
    getProjectDetails, 
    createProject, 
    updateProject,
    volunteerForProject,
    removeVolunteer,
    isUserVolunteering,
    addFavorite,
    removeFavorite,
    getFavoriteProjects,
    isProjectFavorite
} from '../models/projects.js';
import { getCategoriesByProjectId, getAllCategories, updateCategoryAssignments } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Define validation rules for projects
const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

// Define any controller functions
const showProjectsPage = async (req, res) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        
        if (req.session.user) {
            const favoriteProjects = await getFavoriteProjects(req.session.user.user_id);
            const favoriteIds = new Set(favoriteProjects.map(p => p.project_id));
            projects.forEach(p => {
                p.isFavorite = favoriteIds.has(p.project_id);
            });
        }

        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        console.error('Error loading projects page:', error);
        res.status(500).send('An error occurred while loading projects.');
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesByProjectId(projectId);
        const title = 'Project Details';
        
        let isVolunteering = false;
        let isFavorite = false;
        if (req.session.user) {
            isVolunteering = await isUserVolunteering(projectId, req.session.user.user_id);
            isFavorite = await isProjectFavorite(projectId, req.session.user.user_id);
        }

        res.render('project', { title, project, categories, isVolunteering, isFavorite });
    } catch (error) {
        next(error);
    }
};

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();
    const categories = await getAllCategories();
    const title = 'Add New Service Project';

    res.render('new-project', { title, organizations, categories });
}

const processNewProjectForm = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new project form
        return res.redirect('/new-project');
    }

    // Extract form data from req.body
    const { title, description, location, date, organizationId, categoryIds } = req.body;

    try {
        // Create the new project in the database
        const newProjectId = await createProject(title, description, location, date, organizationId);

        // Assign categories if any were selected
        if (categoryIds) {
            const categoryIdsArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
            await updateCategoryAssignments(newProjectId, categoryIdsArray);
        }

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
}

const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }

        const organizations = await getAllOrganizations();
        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);
        const title = 'Edit Service Project';

        res.render('edit-project', { title, project, organizations, categories, assignedCategories });
    } catch (error) {
        next(error);
    }
}

const processEditProjectForm = async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit project form
        return res.redirect(`/edit-project/${req.params.id}`);
    }

    // Extract form data from req.body
    const projectId = req.params.id;
    const { title, description, location, date, organizationId, categoryIds } = req.body;

    try {
        // Update the project in the database
        await updateProject(projectId, title, description, location, date, organizationId);

        // Update category assignments
        const categoryIdsArray = categoryIds ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds]) : [];
        await updateCategoryAssignments(projectId, categoryIdsArray);

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating project:', error);
        req.flash('error', 'There was an error updating the service project.');
        res.redirect(`/edit-project/${projectId}`);
    }
}

const handleVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;
        
        await volunteerForProject(projectId, userId);
        
        req.flash('success', 'You have successfully volunteered for this project!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error volunteering for project:', error);
        req.flash('error', 'An error occurred while signing up to volunteer.');
        res.redirect(`/project/${req.params.id}`);
    }
};

const handleRemoveVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;
        
        await removeVolunteer(projectId, userId);
        
        req.flash('success', 'You have been removed as a volunteer from this project.');
        
        // If coming from dashboard, redirect back there, otherwise back to project details
        const referer = req.get('Referer');
        if (referer && referer.includes('/dashboard')) {
            res.redirect('/dashboard');
        } else {
            res.redirect(`/project/${projectId}`);
        }
    } catch (error) {
        console.error('Error removing volunteer status:', error);
        req.flash('error', 'An error occurred while removing your volunteer status.');
        res.redirect(`/project/${req.params.id}`);
    }
};

const handleAddFavorite = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;
        
        await addFavorite(projectId, userId);
        
        req.flash('success', 'Project added to favorites!');
        
        // Redirect back to the previous page
        const referer = req.get('Referer');
        if (referer) {
            res.redirect(referer);
        } else {
            res.redirect(`/project/${projectId}`);
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
        req.flash('error', 'An error occurred while adding to favorites.');
        res.redirect(`/project/${req.params.id}`);
    }
};

const handleRemoveFavorite = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;
        
        await removeFavorite(projectId, userId);
        
        req.flash('success', 'Project removed from favorites.');
        
        // Redirect back to the previous page
        const referer = req.get('Referer');
        if (referer) {
            res.redirect(referer);
        } else {
            res.redirect(`/project/${projectId}`);
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        req.flash('error', 'An error occurred while removing from favorites.');
        res.redirect(`/project/${req.params.id}`);
    }
};

// Export any controller functions
export { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showNewProjectForm, 
    processNewProjectForm, 
    showEditProjectForm, 
    processEditProjectForm, 
    projectValidation,
    handleVolunteer,
    handleRemoveVolunteer,
    handleAddFavorite,
    handleRemoveFavorite
};
