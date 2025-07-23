import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getUserCertifications,
  getCertificationById,
  verifyCertification,
  issueCertification,
  getCertificationsByLanguage,
  getCertificationStats,
  generateDigitalBadge,
  shareCertification,
  revokeCertification
} from '../controllers/certificationController.js';

const router = express.Router();

// Public routes
router.get('/verify/:verificationCode', verifyCertification);
router.get('/:id', getCertificationById);

// Protected routes
router.get('/', verifyToken, getUserCertifications);
router.get('/language/:languageId', verifyToken, getCertificationsByLanguage);
router.get('/:id/badge', verifyToken, generateDigitalBadge);
router.post('/:id/share', verifyToken, shareCertification);

// Admin/Teacher routes
router.post('/', verifyToken, issueCertification); // Add role check middleware later
router.get('/admin/stats', verifyToken, getCertificationStats); // Add admin middleware later
router.put('/:id/revoke', verifyToken, revokeCertification); // Add admin middleware later

export default router;
