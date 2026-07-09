CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

INSERT INTO organizations (name, description, contact_email, logo_filename)
VALUES 
(
    'BrightFuture Builders', 
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 
    'info@brightfuturebuilders.org', 
    'brightfuture-logo.png'
),
(
    'GreenHarvest Growers', 
    'An urban farming collective promoting food sustainability and education in local neighborhoods.', 
    'contact@greenharvest.org', 
    'greenharvest-logo.png'
),
(
    'UnityServe Volunteers', 
    'A volunteer coordination group supporting local charities and service initiatives.', 
    'hello@unityserve.org', 
    'unityserve-logo.png'
);

-- Create the service_projects table to map the 1:N relationship with organizations
CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
	
    -- Foreign key constraint linking to the organizations table
    CONSTRAINT fk_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(organization_id) 
        ON DELETE CASCADE
);

INSERT INTO service_projects (organization_id, title, description, location, date)
VALUES
-- Projects for BrightFuture Builders (ID: 1)
(1, 'Community Center Renovation', 'Repairing the roof and painting the local youth center.', 'Downtown Community Center', '2026-08-12'),
(1, 'Park Bench Installation', 'Building and installing eco-friendly benches across the city park.', 'Central Park', '2026-09-05'),
(1, 'Wheelchair Ramp Construction', 'Building accessibility ramps for elderly residents in the neighborhood.', 'Suburban Housing Block B', '2026-10-01'),
(1, 'Sustainable Tiny Homes Workshop', 'Helping construct a prototype of a sustainable tiny home for homeless support.', 'Greenyard Workshop', '2026-11-15'),
(1, 'School Playground Repair', 'Fixing fences and swings at the local primary school.', 'St. Jude Elementary School', '2026-12-03'),

-- Projects for GreenHarvest Growers (ID: 2)
(2, 'Urban Garden Planting', 'Sowing seasonal vegetables and setting up automated irrigation paths.', 'East Side Community Garden', '2026-08-20'),
(2, 'Composting Seminar & Setup', 'Teaching residents how to compost and distributing bins.', 'Community Hall Room 3', '2026-09-18'),
(2, 'School Greenhouse Build', 'Setting up a small educational greenhouse for biology students.', 'Northside High School', '2026-10-10'),
(2, 'Fruit Tree Orchard Initiative', 'Planting 50 fruit-bearing trees in abandoned urban spaces.', 'West End Public Plots', '2026-11-05'),
(2, 'Harvest and Distribution Day', 'Gathering ripe produce and packaging it for low-income families.', 'GreenHarvest HQ', '2026-11-28'),

-- Projects for UnityServe Volunteers (ID: 3)
(3, 'Senior Citizen Tech Support', 'Helping elderly residents learn how to use smartphones and video call family.', 'Autumn Care Home', '2026-08-25'),
(3, 'Local Beach Cleanup', 'Gathering plastic waste and debris from the coastline.', 'South Beach Pier', '2026-09-12'),
(3, 'Food Bank Sorting', 'Organizing incoming donations and checking expiration dates.', 'Central Food Pantry', '2026-10-05'),
(3, 'Homeless Shelter Meal Service', 'Preparing and serving hot dinners for shelter residents.', 'Hope Soup Kitchen', '2026-10-22'),
(3, 'After-School Tutoring Launch', 'Assisting kids with math and reading homework.', 'Local Library Annex', '2026-11-02');


-- Verify that data was correctly inserted and relationships are properly established
SELECT 
    p.project_id,
    o.name AS organization_name,
    p.title AS project_title,
    p.location,
    p.date
FROM service_projects p
JOIN organizations o ON p.organization_id = o.organization_id;

-- Alter the service_projects table to add the image_url column
ALTER TABLE service_projects 
ADD COLUMN image_url VARCHAR(500) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1559027615-cd2b7194f1c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

-- Remove the default constraint if you want future inserts to require an explicit URL
ALTER TABLE service_projects 
ALTER COLUMN image_url DROP DEFAULT;

-- Update image URLs using reliable placeholder services with specific keywords

-- Update image URLs for BrightFuture Builders projects (ID: 1 - Construction/Infrastructure)
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/construction,building/all' WHERE project_id = 1;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/architecture,tools/all' WHERE project_id = 2;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/carpentry,wood/all' WHERE project_id = 3;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/engineer,site/all' WHERE project_id = 4;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/renovation,paint/all' WHERE project_id = 5;

-- Update image URLs for GreenHarvest Growers projects (ID: 2 - Urban Farming/Sustainability)
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/farming,garden/all' WHERE project_id = 6;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/agriculture,plants/all' WHERE project_id = 7;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/greenhouse,nature/all' WHERE project_id = 8;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/vegetables,harvest/all' WHERE project_id = 9;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/organic,soil/all' WHERE project_id = 10;

-- Update image URLs for UnityServe Volunteers projects (ID: 3 - Community Volunteering)
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/volunteers,community/all' WHERE project_id = 11;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/charity,help/all' WHERE project_id = 12;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/support,people/all' WHERE project_id = 13;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/kindness,group/all' WHERE project_id = 14;
UPDATE service_projects SET image_url = 'https://loremflickr.com/800/600/teamwork,social/all' WHERE project_id = 15;