import prisma from '../utils/prisma.js';
import { transformEnquiry } from '../utils/transform.js';

const INCLUDE_FULL = {
  property: {
    include: { images: { take: 1, orderBy: { createdAt: 'asc' } } },
  },
  tenant: { select: { id: true, name: true, email: true, phone: true, role: true, verified: true, createdAt: true } },
};

export async function createEnquiry(req, res) {
  try {
    const { propertyId, message } = req.body;

    if (!propertyId || !message?.trim()) {
      return res.status(400).json({ error: 'Property ID and message are required' });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (!property.approved) return res.status(400).json({ error: 'Property is not available' });

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId,
        tenantId: req.user.id,
        message: message.trim(),
      },
      include: INCLUDE_FULL,
    });

    return res.status(201).json(transformEnquiry(enquiry));
  } catch (err) {
    console.error('createEnquiry error:', err);
    return res.status(500).json({ error: 'Failed to send enquiry' });
  }
}

export async function getLandlordEnquiries(req, res) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: { property: { landlordId: req.user.id } },
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ data: enquiries.map(transformEnquiry) });
  } catch (err) {
    console.error('getLandlordEnquiries error:', err);
    return res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
}

export async function getTenantEnquiries(req, res) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: { tenantId: req.user.id },
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ data: enquiries.map(transformEnquiry) });
  } catch (err) {
    console.error('getTenantEnquiries error:', err);
    return res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
}

export async function updateEnquiryStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['NEW', 'CONTACTED', 'CLOSED'];
    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status. Must be NEW, CONTACTED or CLOSED' });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });

    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    if (enquiry.property.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: { status: status.toUpperCase() },
      include: INCLUDE_FULL,
    });

    return res.json(transformEnquiry(updated));
  } catch (err) {
    console.error('updateEnquiryStatus error:', err);
    return res.status(500).json({ error: 'Failed to update enquiry status' });
  }
}
