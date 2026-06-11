import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../utils/prisma.js';
import { transformUser } from '../utils/transform.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function googleConfig(_req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';
  return res.json({
    configured: Boolean(clientId),
    clientId,
  });
}

export async function register(req, res) {
  try {
    const { name, email, password, role = 'TENANT', phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedRole = role.toUpperCase();
    if (!['TENANT', 'LANDLORD'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: normalizedRole,
        phone: phone?.trim() || null,
      },
    });

    const token = signToken(user.id);
    return res.status(201).json({ user: transformUser(user), token });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    return res.json({ user: transformUser(user), token });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

export async function googleLogin(req, res) {
  try {
    const { credential, role = 'TENANT' } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google sign-in is not configured' });
    }
    if (!credential) {
      return res.status(400).json({ error: 'Google sign-in token is required' });
    }

    const normalizedRole = String(role).toUpperCase();
    if (!['TENANT', 'LANDLORD'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ error: 'Google account email is required' });
    }

    const email = payload.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            verified: existing.verified || Boolean(payload.email_verified),
            ...(existing.name ? {} : { name: payload.name || email.split('@')[0] }),
          },
        })
      : await prisma.user.create({
          data: {
            name: payload.name || email.split('@')[0],
            email,
            password: await bcrypt.hash(`google:${payload.sub}:${process.env.JWT_SECRET}`, 12),
            role: normalizedRole,
            verified: Boolean(payload.email_verified),
          },
        });

    const token = signToken(user.id);
    return res.json({ user: transformUser(user), token });
  } catch (err) {
    console.error('googleLogin error:', err);
    return res.status(401).json({ error: 'Google sign-in failed' });
  }
}

export async function getMe(req, res) {
  return res.json({ user: transformUser(req.user) });
}

export async function updateMe(req, res) {
  try {
    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
      },
    });
    return res.json({ user: transformUser(updated) });
  } catch (err) {
    console.error('updateMe error:', err);
    return res.status(500).json({ error: 'Update failed' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const valid = await bcrypt.compare(currentPassword, req.user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ error: 'Password change failed' });
  }
}

export async function getAdminUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            properties: true,
            enquiries: true,
            savedProperties: true,
          },
        },
      },
    });

    return res.json({
      data: users.map(user => ({
        ...transformUser(user),
        listingCount: user._count.properties,
        enquiryCount: user._count.enquiries,
        savedCount: user._count.savedProperties,
      })),
    });
  } catch (err) {
    console.error('getAdminUsers error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateAdminUser(req, res) {
  try {
    const { role, verified } = req.body;
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!target) return res.status(404).json({ error: 'User not found' });

    const data = {};
    if (verified !== undefined) data.verified = Boolean(verified);

    if (role !== undefined) {
      const normalizedRole = String(role).toUpperCase();
      if (!['TENANT', 'LANDLORD', 'ADMIN'].includes(normalizedRole)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      if (target.id === req.user.id && normalizedRole !== 'ADMIN') {
        return res.status(400).json({ error: 'You cannot remove your own admin access' });
      }
      data.role = normalizedRole;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No user changes provided' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
      include: {
        _count: {
          select: {
            properties: true,
            enquiries: true,
            savedProperties: true,
          },
        },
      },
    });

    return res.json({
      user: {
        ...transformUser(updated),
        listingCount: updated._count.properties,
        enquiryCount: updated._count.enquiries,
        savedCount: updated._count.savedProperties,
      },
    });
  } catch (err) {
    console.error('updateAdminUser error:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteAdminUser(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'User not found' });

    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteAdminUser error:', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}
