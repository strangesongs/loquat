import * as db from '../schemas/schemas.js';
import { PinsQueryError } from '../schemas/errors.js';
import { escapeHtml } from '../utils/html.js';
import { containsProfanity } from '../utils/profanity.js';
import { isDuplicateConfirm, markConfirmed } from '../utils/confirmDedup.js';
import crypto from 'crypto';
import { Resend } from 'resend';
import { FRUIT_LIST } from '../../client/utils/fruitList.js';

const FRUIT_SET = new Set(FRUIT_LIST);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function sendPinsError(res, err, logLabel) {
  if (err instanceof PinsQueryError) {
    console.error(`${logLabel} DynamoDB failure:`, err.cause);
    return res
      .status(503)
      .json({ success: false, message: 'Map data is temporarily unavailable. Please try again.' });
  }
  return null;
}

export const createPin = async (req, res) => {
  const { coordinates, fruitType, notes } = req.body;
  const submittedBy = req.user.userName;
  if (!coordinates || !coordinates.lat || !coordinates.lng || !fruitType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: coordinates and fruitType are required',
    });
  }
  if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    return res.status(400).json({ success: false, message: 'Coordinates must be numbers' });
  }
  if (!FRUIT_SET.has(fruitType.trim().toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid fruit type. Please select from the approved list.',
    });
  }
  if (notes && notes.split(' ').length > 500) {
    return res.status(400).json({ success: false, message: 'Notes cannot exceed 500 words' });
  }
  if (containsProfanity(notes)) {
    return res.status(400).json({ success: false, message: 'Please keep notes family-friendly.' });
  }
  try {
    const pin = await db.createPin({
      coordinates,
      fruitType: fruitType.trim().toLowerCase(),
      notes: notes ? notes.trim() : '',
      submittedBy: submittedBy.trim(),
    });
    if (!pin) {
      return res.status(500).json({ success: false, message: 'Failed to create pin' });
    }
    res.json({ success: true, pin });
    const adminEmail = process.env.ADMIN_EMAIL;
    if (resend && adminEmail && process.env.PIN_NOTIFICATIONS === 'true') {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      resend
        .emails.send({
          from: 'fruit for all <noreply@fruitforall.app>',
          to: adminEmail,
          subject: `new pin: ${pin.fruitTypeDisplay || fruitType} by ${submittedBy}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #333;">
              <h2 style="color: #C23939;">new pin submitted</h2>
              <p><strong>fruit:</strong> ${pin.fruitTypeDisplay || fruitType}</p>
              <p><strong>submitted by:</strong> ${escapeHtml(submittedBy)}</p>
              <p><strong>coordinates:</strong> ${coordinates.lat}, ${coordinates.lng}</p>
              ${pin.notes ? `<p><strong>notes:</strong> ${escapeHtml(pin.notes)}</p>` : ''}
              <p><strong>time:</strong> ${new Date().toUTCString()}</p>
              <p style="margin-top: 24px;"><a href="${appUrl}" style="color: #D84747;">fruitforall.app</a></p>
            </div>
          `,
        })
        .catch((err) => console.error('[EMAIL] Pin notification failed:', err.message));
    }
  } catch (error) {
    console.error('Error in createPin controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getIpLocation = async (req, res) => {
  try {
    let ip = req.ip || '';
    if (ip.startsWith('::ffff:')) ip = ip.slice(7);
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return res.json({ lat: null, lng: null, city: null });
    }
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
    if (!response.ok) return res.json({ lat: null, lng: null, city: null });
    const data = await response.json();
    if (data.error || !data.latitude || !data.longitude) {
      return res.json({ lat: null, lng: null, city: null });
    }
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.json({ lat: data.latitude, lng: data.longitude, city: data.city || null });
  } catch (e) {
    return res.json({ lat: null, lng: null, city: null });
  }
};

export const getPublicPins = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng, limit, cursor } = req.query;
    const parsedLimit = Math.min(limit ? (parseInt(limit, 10) || 200) : 200, 500);
    const bounds =
      minLat && maxLat && minLng && maxLng
        ? {
            minLat: parseFloat(minLat),
            maxLat: parseFloat(maxLat),
            minLng: parseFloat(minLng),
            maxLng: parseFloat(maxLng),
          }
        : null;
    const result = await db.getAllPins({ limit: parsedLimit, cursor, bounds });
    const publicPins = result.pins.map(({ submittedBy, ...pin }) => pin);
    if (bounds) {
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=60');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
    res.json({
      success: true,
      pins: publicPins,
      cursor: result.cursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    if (sendPinsError(res, error, 'getPublicPins')) return;
    console.error('Error in getPublicPins controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllPins = async (req, res) => {
  try {
    const { limit, cursor, submittedBy, minLat, maxLat, minLng, maxLng } = req.query;
    const parsedLimit = Math.min(limit ? parseInt(limit, 10) || 1000 : 1000, 5000);
    const bounds =
      minLat && maxLat && minLng && maxLng
        ? {
            minLat: parseFloat(minLat),
            maxLat: parseFloat(maxLat),
            minLng: parseFloat(minLng),
            maxLng: parseFloat(maxLng),
          }
        : null;
    const result = await db.getAllPins({
      limit: parsedLimit,
      cursor,
      submittedBy,
      bounds,
    });
    const dataString = JSON.stringify(result.pins);
    const etag = `"${crypto.createHash('md5').update(dataString).digest('hex')}"`;
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.json({
      success: true,
      pins: result.pins,
      cursor: result.cursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    if (sendPinsError(res, error, 'getAllPins')) return;
    console.error('Error in getAllPins controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyPins = async (req, res) => {
  try {
    const { limit, cursor } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const result = await db.getAllPins({
      limit: parsedLimit,
      cursor,
      submittedBy: req.user.userName,
    });
    res.json({
      success: true,
      pins: result.pins,
      cursor: result.cursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    if (sendPinsError(res, error, 'getMyPins')) return;
    console.error('Error in getMyPins controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePin = async (req, res) => {
  try {
    const { pinId } = req.params;
    const { notes } = req.body;
    const pin = await db.getPinById(pinId);
    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found' });
    }
    const isAdmin = req.user.isAdmin || false;
    const isOwner = pin.submittedBy === req.user.userName;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or pin owner can edit this pin',
      });
    }
    if (containsProfanity(notes)) {
      return res.status(400).json({ success: false, message: 'Please keep notes family-friendly.' });
    }
    const updatedPin = await db.updatePin(pinId, { notes: notes || '' });
    res.json({ success: true, message: 'Pin updated successfully', pin: updatedPin });
  } catch (error) {
    console.error('Error in updatePin controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const confirmPin = async (req, res) => {
  try {
    const { pinId } = req.params;
    if (!pinId || typeof pinId !== 'string' || pinId.length > 64) {
      return res.status(400).json({ success: false, message: 'Invalid pin ID' });
    }

    const ip = req.ip ?? '127.0.0.1';
    const redisClient = req.redisClient ?? null;

    if (await isDuplicateConfirm(redisClient, pinId, ip)) {
      return res.status(409).json({ success: false, message: 'Already confirmed recently' });
    }

    const updatedPin = await db.confirmPin(pinId);
    if (!updatedPin) {
      return res.status(404).json({ success: false, message: 'Pin not found' });
    }

    await markConfirmed(redisClient, pinId, ip);

    res.json({ success: true, confirmations: updatedPin.confirmations });
  } catch (error) {
    console.error('Error in confirmPin controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deletePin = async (req, res) => {
  try {
    const { pinId } = req.params;
    const pin = await db.getPinById(pinId);
    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found' });
    }
    const isAdmin = req.user.isAdmin || false;
    const isOwner = pin.submittedBy === req.user.userName;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or pin owner can delete this pin',
      });
    }
    await db.deletePin(pinId);
    res.json({ success: true, message: 'Pin deleted successfully' });
  } catch (error) {
    console.error('Error in deletePin controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
