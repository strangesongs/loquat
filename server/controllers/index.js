import {
  verifyToken,
  registerUser,
  loginUser,
  getCurrentUser,
  saveButton,
  forgotPassword,
  resetPassword,
} from './auth.js';
import {
  createPin,
  confirmPin,
  getIpLocation,
  getPublicPins,
  getAllPins,
  getMyPins,
  updatePin,
  deletePin,
} from './pinsController.js';

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  saveButton,
  forgotPassword,
  resetPassword,
  createPin,
  confirmPin,
  getIpLocation,
  getPublicPins,
  getAllPins,
  getMyPins,
  updatePin,
  deletePin,
  verifyToken,
};
