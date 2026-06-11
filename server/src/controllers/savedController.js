import prisma from '../utils/prisma.js';
import { transformProperty } from '../utils/transform.js';

export async function getSaved(req, res) {
  try {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user.id },
      include: {
        property: { include: { images: { take: 1, orderBy: { createdAt: 'asc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const properties = saved
      .filter(s => s.property)
      .map(s => transformProperty(s.property));

    return res.json({ data: properties });
  } catch (err) {
    console.error('getSaved error:', err);
    return res.status(500).json({ error: 'Failed to fetch saved properties' });
  }
}

export async function saveProperty(req, res) {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ error: 'Property ID required' });

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    await prisma.savedProperty.upsert({
      where: { userId_propertyId: { userId: req.user.id, propertyId } },
      create: { userId: req.user.id, propertyId },
      update: {},
    });

    // Increment saves count
    await prisma.property.update({ where: { id: propertyId }, data: { saves: { increment: 1 } } });

    return res.status(201).json({ message: 'Property saved', propertyId });
  } catch (err) {
    console.error('saveProperty error:', err);
    return res.status(500).json({ error: 'Failed to save property' });
  }
}

export async function unsaveProperty(req, res) {
  try {
    const { propertyId } = req.params;

    const existing = await prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: req.user.id, propertyId } },
    });

    if (!existing) return res.status(404).json({ error: 'Saved record not found' });

    await prisma.savedProperty.delete({
      where: { userId_propertyId: { userId: req.user.id, propertyId } },
    });

    // Decrement saves count
    await prisma.property.update({
      where: { id: propertyId },
      data: { saves: { decrement: 1 } },
    }).catch(() => {}); // ignore if property was deleted

    return res.json({ message: 'Property removed from saved', propertyId });
  } catch (err) {
    console.error('unsaveProperty error:', err);
    return res.status(500).json({ error: 'Failed to unsave property' });
  }
}

export async function getSavedIds(req, res) {
  try {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user.id },
      select: { propertyId: true },
    });
    return res.json({ data: saved.map(s => s.propertyId) });
  } catch (err) {
    console.error('getSavedIds error:', err);
    return res.status(500).json({ error: 'Failed to fetch saved IDs' });
  }
}
