// Import any needed model functions
import { getAllCategories, getCategoryDetails, getProjectsByCategoryId } from '../models/categories.js';

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';
    res.render('categories', { title, categories });
};

const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryDetails(categoryId);

        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByCategoryId(categoryId);
        const title = `${category.name} Projects`;
        res.render('category', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

// Export any controller functions
export { showCategoriesPage, showCategoryDetailsPage };
