import { Router } from 'express';
import HttpStatus from 'http-status-codes';
import * as userService from '../services/userService';
import * as clientDetailService from '../services/clientDetailService';
import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

/**
 * GET /api/users/ to check if username or email already exist
 */
router.get('/check', (req, res, next) => {
  userService
    .checkUsers(req.query)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});
/**
 * GET /api/users
 */
router.get('/', (req, res, next) => {
  userService
    .getAllUsers()
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

/**
 * GET /api/users/:id
 */
router.get('/:id', (req, res, next) => {
  userService
    .getUser(req.params.id)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

/**
 * POST /api/users
 */
router.post('/client', userValidator, async (req, res, next) => {
  try {
    const userResponse = await userService.createUser(req.body);
    if (userResponse) {
      const userId = userResponse.id;
      const clientResponse = await clientDetailService.createClientDetails(userId, req.body);
      if (clientResponse) {
        res.status(HttpStatus.CREATED).json({
          userResponse,
          clientResponse,
        });
      } else {
        res.status(HttpStatus.CONFLICT).json({
          message: 'Details not added due to database server conflict. Please try again.',
        });
      }
    } else {
      res.status(HttpStatus.CONFLICT).json({
        message: 'Account not created due to server conflict. Please try again.',
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/:id
 */
router.put('/:id', findUser, userValidator, (req, res, next) => {
  userService
    .updateUser(req.params.id, req.body)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

/**
 * DELETE /api/users/:id
 */
router.delete('/:id', findUser, (req, res, next) => {
  userService
    .deleteUser(req.params.id)
    .then(data => res.status(HttpStatus.NO_CONTENT).json({ data }))
    .catch(err => next(err));
});

export default router;
