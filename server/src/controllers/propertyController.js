import prisma from '../utils/prisma.js';
import { transformProperty } from '../utils/transform.js';

const INCLUDE_IMAGES = { images: { orderBy: { createdAt: 'asc' } } };
const PUBLIC_AREAS = ['Malabe', 'Kaduwela'];

function isSupportedArea(area) {
  return PUBLIC_AREAS.includes(area);
}

function normalizeCoordinate(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeMapLocation({ latitude, longitude, googleMapUrl }, required = false) {
  const lat = normalizeCoordinate(latitude);
  const lng = normalizeCoordinate(longitude);
  const hasAnyLocation = lat !== null || lng !== null || Boolean(googleMapUrl?.trim());

  if (required && (lat === null || lng === null)) {
    return { error: 'Please add an exact Google Maps pin for this property' };
  }

  if (hasAnyLocation && (lat === null || lng === null)) {
    return { error: 'We could not read an exact map pin from that location. Please paste the exact Google Maps pin numbers.' };
  }

  if (lat !== null && (lat < -90 || lat > 90)) {
    return { error: 'Latitude must be between -90 and 90' };
  }

  if (lng !== null && (lng < -180 || lng > 180)) {
    return { error: 'Longitude must be between -180 and 180' };
  }

  if (lat === null || lng === null) return { data: {} };

  return {
    data: {
      latitude: lat,
      longitude: lng,
      googleMapUrl: googleMapUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    },
  };
}

export async function getProperties(req, res) {
  try {
    const {
      area, type, minPrice, maxPrice, q, featured,
      sortBy = 'newest', page = '1', limit = '12',
      furnished, gender,
    } = req.query;

    const where = { approved: true, area: { in: PUBLIC_AREAS } };

    if (area) {
      where.area = PUBLIC_AREAS.includes(area) ? area : '__unsupported_area__';
    }
    if (type) where.type = type.toUpperCase();
    if (featured === 'true') where.featured = true;
    if (furnished === 'true') where.furnished = true;
    if (furnished === 'false') where.furnished = false;
    if (gender) where.gender = gender.toUpperCase();
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { area: { contains: q } },
        { description: { contains: q } },
        { address: { contains: q } },
      ];
    }

    const orderBy = {
      newest: { createdAt: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      popular: { views: 'desc' },
    }[sortBy] ?? { createdAt: 'desc' };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({ where, include: INCLUDE_IMAGES, orderBy, skip, take: limitNum }),
      prisma.property.count({ where }),
    ]);

    return res.json({
      data: properties.map(transformProperty),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('getProperties error:', err);
    return res.status(500).json({ error: 'Failed to fetch properties' });
  }
}

export async function getAreaCounts(_req, res) {
  try {
    const grouped = await prisma.property.groupBy({
      by: ['area'],
      where: {
        approved: true,
        area: { in: PUBLIC_AREAS },
      },
      _count: { _all: true },
    });

    const counts = Object.fromEntries(PUBLIC_AREAS.map(area => [area, 0]));
    grouped.forEach(row => {
      counts[row.area] = row._count._all;
    });

    return res.json({ data: counts });
  } catch (err) {
    console.error('getAreaCounts error:', err);
    return res.status(500).json({ error: 'Failed to fetch area listing counts' });
  }
}

export async function getPropertyById(req, res) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: INCLUDE_IMAGES,
    });

    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Increment views
    await prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } });

    return res.json(transformProperty({ ...property, views: property.views + 1 }));
  } catch (err) {
    console.error('getPropertyById error:', err);
    return res.status(500).json({ error: 'Failed to fetch property' });
  }
}

export async function createProperty(req, res) {
  try {
    const {
      title, description, price, priceUnit = 'monthly', type, area, address,
      distanceFromSLIIT, nearbyLandmarks = [], amenities = [], furnished = true,
      gender = 'ANY', occupancy = 'SINGLE', bathrooms = 1,
      availableFrom, contactName, contactPhone, contactWhatsApp, imageUrls = [],
      latitude, longitude, googleMapUrl,
    } = req.body;

    if (!title || !description || !price || !type || !area || !address || !availableFrom || !contactName || !contactPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const areaName = area.trim();
    if (!isSupportedArea(areaName)) {
      return res.status(400).json({ error: 'Listings are currently only available in Malabe and Kaduwela' });
    }

    const location = normalizeMapLocation({ latitude, longitude, googleMapUrl }, true);
    if (location.error) return res.status(400).json({ error: location.error });

    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        priceUnit,
        type: type.toUpperCase(),
        area: areaName,
        address: address.trim(),
        ...location.data,
        distanceFromSLIIT: distanceFromSLIIT ? Number(distanceFromSLIIT) : null,
        nearbyLandmarks: JSON.stringify(Array.isArray(nearbyLandmarks) ? nearbyLandmarks : []),
        amenities: JSON.stringify(Array.isArray(amenities) ? amenities : []),
        furnished: Boolean(furnished),
        gender: (gender || 'ANY').toUpperCase(),
        occupancy: (occupancy || 'SINGLE').toUpperCase(),
        bathrooms: Number(bathrooms) || 1,
        availableFrom: new Date(availableFrom),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactWhatsApp: contactWhatsApp?.trim() || null,
        landlordId: req.user.id,
        images: {
          create: imageUrls.map(url => ({ url })),
        },
      },
      include: INCLUDE_IMAGES,
    });

    return res.status(201).json(transformProperty(property));
  } catch (err) {
    console.error('createProperty error:', err);
    return res.status(500).json({ error: 'Failed to create property' });
  }
}

export async function updateProperty(req, res) {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Property not found' });
    if (existing.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    const {
      title, description, price, type, area, address, distanceFromSLIIT,
      nearbyLandmarks, amenities, furnished, gender, occupancy, bathrooms,
      availableFrom, contactName, contactPhone, contactWhatsApp, imageUrls,
      latitude, longitude, googleMapUrl,
    } = req.body;

    const data = {};
    if (title) data.title = title.trim();
    if (description) data.description = description.trim();
    if (price) data.price = Number(price);
    if (type) data.type = type.toUpperCase();
    if (area) {
      const areaName = area.trim();
      if (!isSupportedArea(areaName)) {
        return res.status(400).json({ error: 'Listings are currently only available in Malabe and Kaduwela' });
      }
      data.area = areaName;
    }
    if (address) data.address = address.trim();
    if (distanceFromSLIIT !== undefined) data.distanceFromSLIIT = distanceFromSLIIT ? Number(distanceFromSLIIT) : null;
    if (nearbyLandmarks) data.nearbyLandmarks = JSON.stringify(Array.isArray(nearbyLandmarks) ? nearbyLandmarks : []);
    if (amenities) data.amenities = JSON.stringify(Array.isArray(amenities) ? amenities : []);
    if (furnished !== undefined) data.furnished = Boolean(furnished);
    if (gender) data.gender = gender.toUpperCase();
    if (occupancy) data.occupancy = occupancy.toUpperCase();
    if (bathrooms) data.bathrooms = Number(bathrooms);
    if (availableFrom) data.availableFrom = new Date(availableFrom);
    if (contactName) data.contactName = contactName.trim();
    if (contactPhone) data.contactPhone = contactPhone.trim();
    if (contactWhatsApp !== undefined) data.contactWhatsApp = contactWhatsApp?.trim() || null;
    if (latitude !== undefined || longitude !== undefined || googleMapUrl !== undefined) {
      const location = normalizeMapLocation({ latitude, longitude, googleMapUrl });
      if (location.error) return res.status(400).json({ error: location.error });
      Object.assign(data, location.data);
    }

    // Replace images if provided
    if (Array.isArray(imageUrls)) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: req.params.id } });
      data.images = { create: imageUrls.map(url => ({ url })) };
    }

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data,
      include: INCLUDE_IMAGES,
    });

    return res.json(transformProperty(updated));
  } catch (err) {
    console.error('updateProperty error:', err);
    return res.status(500).json({ error: 'Failed to update property' });
  }
}

export async function deleteProperty(req, res) {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Property not found' });
    if (existing.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('deleteProperty error:', err);
    return res.status(500).json({ error: 'Failed to delete property' });
  }
}

export async function getMyProperties(req, res) {
  try {
    const properties = await prisma.property.findMany({
      where: { landlordId: req.user.id },
      include: INCLUDE_IMAGES,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ data: properties.map(transformProperty) });
  } catch (err) {
    console.error('getMyProperties error:', err);
    return res.status(500).json({ error: 'Failed to fetch your properties' });
  }
}

export async function getAdminProperties(req, res) {
  try {
    const { status = 'all' } = req.query;
    const where = {};

    if (status === 'pending') where.approved = false;
    if (status === 'approved') where.approved = true;
    if (status === 'verified') where.verified = true;

    const properties = await prisma.property.findMany({
      where,
      include: INCLUDE_IMAGES,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ data: properties.map(transformProperty) });
  } catch (err) {
    console.error('getAdminProperties error:', err);
    return res.status(500).json({ error: 'Failed to fetch listings for moderation' });
  }
}

export async function moderateProperty(req, res) {
  try {
    const { approved, verified, featured } = req.body;
    const data = {};

    if (approved !== undefined) data.approved = Boolean(approved);
    if (verified !== undefined) data.verified = Boolean(verified);
    if (featured !== undefined) data.featured = Boolean(featured);

    if (data.approved === false) {
      data.verified = false;
      data.featured = false;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No moderation changes provided' });
    }

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data,
      include: INCLUDE_IMAGES,
    });

    return res.json(transformProperty(property));
  } catch (err) {
    console.error('moderateProperty error:', err);
    return res.status(500).json({ error: 'Failed to update listing moderation' });
  }
}
