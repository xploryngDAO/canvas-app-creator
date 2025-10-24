import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';

const router: Router = Router();
const projectController = new ProjectController();

// GET /api/projects - Get all projects
router.get('/', (req, res) => projectController.getAllProjects(req, res));

// GET /api/projects/:id - Get project by ID
router.get('/:id', (req, res) => projectController.getProjectById(req, res));

// POST /api/projects - Create new project
router.post('/', (req, res) => projectController.createProject(req, res));

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => projectController.updateProject(req, res));

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => projectController.deleteProject(req, res));

// POST /api/projects/compile - Compile project
router.post('/compile', (req, res) => projectController.compileProject(req, res));

export default router;