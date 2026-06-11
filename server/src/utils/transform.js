// Transform Prisma DB records to the shape the frontend expects

export function transformProperty(p) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type.toLowerCase(),
    price: p.price,
    priceUnit: p.priceUnit,
    area: p.area,
    address: p.address,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    googleMapUrl: p.googleMapUrl ?? undefined,
    distanceFromSLIIT: p.distanceFromSLIIT ?? undefined,
    nearbyLandmarks: typeof p.nearbyLandmarks === 'string' ? JSON.parse(p.nearbyLandmarks) : (p.nearbyLandmarks ?? []),
    images: p.images ? p.images.map(img => img.url) : [],
    amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities) : (p.amenities ?? []),
    furnished: p.furnished,
    gender: p.gender.toLowerCase(),
    occupancy: p.occupancy.toLowerCase(),
    bathrooms: p.bathrooms,
    availableFrom: p.availableFrom instanceof Date
      ? p.availableFrom.toISOString().split('T')[0]
      : p.availableFrom,
    contactName: p.contactName,
    contactPhone: p.contactPhone,
    contactWhatsApp: p.contactWhatsApp ?? undefined,
    verified: p.verified,
    featured: p.featured,
    approved: p.approved,
    createdAt: p.createdAt instanceof Date
      ? p.createdAt.toISOString().split('T')[0]
      : p.createdAt,
    landlordId: p.landlordId,
    views: p.views,
    saves: p.saves,
  };
}

export function transformUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),
    phone: u.phone ?? undefined,
    verified: u.verified,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

export function transformEnquiry(e) {
  return {
    id: e.id,
    message: e.message,
    status: e.status.toLowerCase(),
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    propertyId: e.propertyId,
    tenantId: e.tenantId,
    property: e.property ? transformProperty(e.property) : undefined,
    tenant: e.tenant ? transformUser(e.tenant) : undefined,
  };
}
