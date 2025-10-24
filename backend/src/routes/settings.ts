import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';

const router: Router = Router();
const settingsController = new SettingsController();

// GET /api/settings - Get all settings
router.get('/', (req, res) => settingsController.getAllSettings(req, res));

// GET /api/settings/:key - Get specific setting
router.get('/:key', (req, res) => settingsController.getSetting(req, res));

// POST /api/settings/:key - Set specific setting
router.post('/:key', (req, res) => settingsController.setSetting(req, res));

// DELETE /api/settings/:key - Delete specific setting
router.delete('/:key', (req, res) => settingsController.deleteSetting(req, res));

// POST /api/settings/gemini/api-key - Set Gemini API key
router.post('/gemini/api-key', (req, res) => settingsController.setGeminiApiKey(req, res));

// GET /api/settings/gemini/api-key - Get Gemini API key status
router.get('/gemini/api-key', (req, res) => settingsController.getGeminiApiKey(req, res));

// POST /api/settings/gemini/test - Test Gemini API key
router.post('/gemini/test', settingsController.testGeminiApiKey.bind(settingsController));

export default router;