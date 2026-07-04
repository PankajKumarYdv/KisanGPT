import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Government scheme endpoints placeholders
router.get('/matches', authenticateToken, (req, res) => res.status(501).json({ message: 'Not Implemented' }));

export default router;
