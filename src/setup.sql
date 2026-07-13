-- =============================================================================
-- 1. CLEAN DATABASE (DROP EXISTING TABLES)
-- =============================================================================
-- CASCADE automatically drops dependent objects like foreign keys and junction tables
DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS service_projects CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- =============================================================================
-- 2. TABLE CREATION
-- =============================================================================

-- Create organizations table
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- Create service_projects table (with image_url included natively)
CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(organization_id) 
        ON DELETE CASCADE
);

-- Create categories table matching the EJS visual properties
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL
);

-- Create junction table for M:N relationship between projects and categories
CREATE TABLE project_categories (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES service_projects(project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);

-- =============================================================================
-- 3. DATA INSERTION (SEEDING)
-- =============================================================================

-- Insert Organizations
INSERT INTO organizations (name, description, contact_email, logo_filename)
VALUES 
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Insert Service Projects
INSERT INTO service_projects (organization_id, title, description, location, date, image_url)
VALUES
-- BrightFuture Builders (ID: 1)
(1, 'Community Center Renovation', 'Repairing the roof and painting the local youth center.', 'Downtown Community Center', '2026-08-12', 'https://loremflickr.com/800/600/construction,building/all'),
(1, 'Park Bench Installation', 'Building and installing eco-friendly benches across the city park.', 'Central Park', '2026-09-05', 'https://loremflickr.com/800/600/architecture,tools/all'),
(1, 'Wheelchair Ramp Construction', 'Building accessibility ramps for elderly residents in the neighborhood.', 'Suburban Housing Block B', '2026-10-01', 'https://loremflickr.com/800/600/carpentry,wood/all'),
(1, 'Sustainable Tiny Homes Workshop', 'Helping construct a prototype of a sustainable tiny home for homeless support.', 'Greenyard Workshop', '2026-11-15', 'https://loremflickr.com/800/600/engineer,site/all'),
(1, 'School Playground Repair', 'Fixing fences and swings at the local primary school.', 'St. Jude Elementary School', '2026-12-03', 'https://loremflickr.com/800/600/renovation,paint/all'),

-- GreenHarvest Growers (ID: 2)
(2, 'Urban Garden Planting', 'Sowing seasonal vegetables and setting up automated irrigation paths.', 'East Side Community Garden', '2026-08-20', 'https://loremflickr.com/800/600/farming,garden/all'),
(2, 'Composting Seminar & Setup', 'Teaching residents how to compost and distributing bins.', 'Community Hall Room 3', '2026-09-18', 'https://loremflickr.com/800/600/agriculture,plants/all'),
(2, 'School Greenhouse Build', 'Setting up a small educational greenhouse for biology students.', 'Northside High School', '2026-10-10', 'https://loremflickr.com/800/600/greenhouse,nature/all'),
(2, 'Fruit Tree Orchard Initiative', 'Planting 50 fruit-bearing trees in abandoned urban spaces.', 'West End Public Plots', '2026-11-05', 'https://loremflickr.com/800/600/vegetables,harvest/all'),
(2, 'Harvest and Distribution Day', 'Gathering ripe produce and packaging it for low-income families.', 'GreenHarvest HQ', '2026-11-28', 'https://loremflickr.com/800/600/organic,soil/all'),

-- UnityServe Volunteers (ID: 3)
(3, 'Senior Citizen Tech Support', 'Helping elderly residents learn how to use smartphones and video call family.', 'Autumn Care Home', '2026-08-25', 'https://loremflickr.com/800/600/volunteers,community/all'),
(3, 'Local Beach Cleanup', 'Gathering plastic waste and debris from the coastline.', 'South Beach Pier', '2026-09-12', 'https://loremflickr.com/800/600/charity,help/all'),
(3, 'Food Bank Sorting', 'Organizing incoming donations and checking expiration dates.', 'Central Food Pantry', '2026-10-05', 'https://loremflickr.com/800/600/support,people/all'),
(3, 'Homeless Shelter Meal Service', 'Preparing and serving hot dinners for shelter residents.', 'Hope Soup Kitchen', '2026-10-22', 'https://loremflickr.com/800/600/kindness,group/all'),
(3, 'After-School Tutoring Launch', 'Assisting kids with math and reading homework.', 'Local Library Annex', '2026-11-02', 'https://loremflickr.com/800/600/teamwork,social/all');

-- Insert Categories (matching the exact ones from the EJS view)
INSERT INTO categories (name, icon, color, image_url)
VALUES 
('Environmental', 'leaf', 'from-emerald-400 to-emerald-600', 'https://loremflickr.com/800/600/nature,forest,environment/all'),
('Educational', 'book-open', 'from-blue-400 to-blue-600', 'https://loremflickr.com/800/600/education,school,books/all'),
('Healthcare', 'activity', 'from-rose-400 to-rose-600', 'https://loremflickr.com/800/600/hospital,healthcare,medical/all'),
('Community', 'users', 'from-amber-400 to-amber-600', 'https://loremflickr.com/800/600/community,volunteers,group/all'),
('Technology', 'cpu', 'from-indigo-400 to-indigo-600', 'https://loremflickr.com/800/600/technology,computer,circuit/all'),
('Animal Welfare', 'dog', 'from-orange-400 to-orange-600', 'https://loremflickr.com/800/600/animals,dog,cat,rescue/all');

-- Associate Projects with Categories (Junction table population)
INSERT INTO project_categories (project_id, category_id) VALUES 
(1, 4), (2, 1), (2, 4), (3, 4), (4, 1), (4, 4), (5, 2), (5, 4), -- BrightFuture Builders maps
(6, 1), (7, 1), (7, 2), (8, 1), (8, 2), (9, 1), (10, 1), (10, 4), -- GreenHarvest Growers maps
(11, 4), (11, 5), (12, 1), (13, 4), (14, 4), (15, 2), (15, 4); -- UnityServe Volunteers maps

-- =============================================================================
-- 4. VERIFICATION QUERIES
-- =============================================================================
-- Check categories sync with dynamic counters
SELECT c.name, c.icon, COUNT(pc.project_id) AS active_projects 
FROM categories c 
LEFT JOIN project_categories pc ON c.category_id = pc.category_id 
GROUP BY c.category_id, c.name, c.icon;