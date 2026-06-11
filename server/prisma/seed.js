import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.savedProperty.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash('password123', 12);

  const [landlord1, landlord2, tenant1] = await Promise.all([
    prisma.user.create({ data: { name: 'Rajitha Perera', email: 'rajitha@roomlanka.lk', password: pw, role: 'LANDLORD', phone: '0771234567', verified: true } }),
    prisma.user.create({ data: { name: 'Chaminda Silva', email: 'chaminda@roomlanka.lk', password: pw, role: 'LANDLORD', phone: '0777654321', verified: true } }),
    prisma.user.create({ data: { name: 'Ashan Wickramasinghe', email: 'ashan@roomlanka.lk', password: pw, role: 'TENANT', verified: true } }),
    prisma.user.create({ data: { name: 'Roomlanka Admin', email: 'admin@roomlanka.lk', password: pw, role: 'ADMIN', verified: true } }),
  ]);

  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Modern Single Room near SLIIT Junction',
        description: 'A clean, modern single room with attached bathroom in a well-maintained house. Ideal for SLIIT or Horizon Campus students. The room comes fully furnished with a study desk, wardrobe, and comfortable bed.',
        price: 12500, priceUnit: 'monthly', type: 'ROOM', area: 'Malabe',
        address: 'No. 45/A, New Kandy Road, Malabe', distanceFromSLIIT: 0.3,
        nearbyLandmarks: JSON.stringify(['SLIIT', 'Malabe Junction', 'Cargills Food City']),
        amenities: JSON.stringify(['WiFi', 'Attached Bathroom', 'Study Desk', 'Wardrobe', 'Security']),
        furnished: true, gender: 'MALE', occupancy: 'SINGLE', bathrooms: 1,
        availableFrom: new Date('2024-03-01'), contactName: 'Rajitha Perera',
        contactPhone: '0771234567', contactWhatsApp: '0771234567',
        verified: true, featured: true, approved: true, views: 312, saves: 24,
        landlordId: landlord1.id,
        images: { create: [
          { url: 'https://picsum.photos/seed/room1a/800/600' },
          { url: 'https://picsum.photos/seed/room1b/800/600' },
        ]},
      },
    }),
    prisma.property.create({
      data: {
        title: 'Spacious Annex with Balcony — Koswatta',
        description: 'Beautifully maintained self-contained annex on the ground floor of a private house. Features a spacious bedroom, separate living area, fully equipped kitchen, and a private balcony.',
        price: 28000, priceUnit: 'monthly', type: 'ANNEX', area: 'Koswatta',
        address: 'No. 12, Koswatta Road, Battaramulla', distanceFromSLIIT: 1.2,
        nearbyLandmarks: JSON.stringify(['SLIIT', 'Horizon Campus', 'Laugfs Supermarket']),
        amenities: JSON.stringify(['WiFi', 'Kitchen', 'Balcony', 'Parking', 'CCTV', 'Washing Machine']),
        furnished: true, gender: 'MIXED', occupancy: 'DOUBLE', bathrooms: 1,
        availableFrom: new Date('2024-03-15'), contactName: 'Chaminda Silva',
        contactPhone: '0777654321', contactWhatsApp: '0777654321',
        verified: true, featured: true, approved: true, views: 489, saves: 41,
        landlordId: landlord2.id,
        images: { create: [
          { url: 'https://picsum.photos/seed/annex2a/800/600' },
          { url: 'https://picsum.photos/seed/annex2b/800/600' },
        ]},
      },
    }),
    prisma.property.create({
      data: {
        title: 'Girls-Only Boarding House — Malabe Town',
        description: 'Safe and comfortable girls-only boarding house managed by a family. Rooms are clean with daily housekeeping available. Meals optional. Gated compound with 24-hour security.',
        price: 14000, priceUnit: 'monthly', type: 'BOARDING', area: 'Malabe',
        address: '78/B, Malabe Road, Malabe', distanceFromSLIIT: 0.7,
        nearbyLandmarks: JSON.stringify(['SLIIT', 'Malabe Hospital', 'Cargills']),
        amenities: JSON.stringify(['WiFi', 'Meals Optional', 'Security Guard', 'CCTV', 'Laundry']),
        furnished: true, gender: 'FEMALE', occupancy: 'SINGLE', bathrooms: 1,
        availableFrom: new Date('2024-02-20'), contactName: 'Priyanka Fernando',
        contactPhone: '0762345678', contactWhatsApp: '0762345678',
        verified: false, featured: true, approved: true, views: 274, saves: 19,
        landlordId: landlord1.id,
        images: { create: [{ url: 'https://picsum.photos/seed/boarding3a/800/600' }]},
      },
    }),
    prisma.property.create({
      data: {
        title: 'Studio Apartment — Battaramulla Road',
        description: 'Premium studio apartment in a residential block. Modern fittings, tile flooring, and large windows providing natural light. Suitable for working professionals.',
        price: 45000, priceUnit: 'monthly', type: 'APARTMENT', area: 'Battaramulla',
        address: '22, Sri Jayawardenepura Road, Battaramulla',
        nearbyLandmarks: JSON.stringify(['Parliament Road', 'Laugfs Gas', 'Keells Super']),
        amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Parking', 'Security', 'Western Kitchen']),
        furnished: true, gender: 'ANY', occupancy: 'SINGLE', bathrooms: 1,
        availableFrom: new Date('2024-04-01'), contactName: 'Rajitha Perera',
        contactPhone: '0771234567',
        verified: true, featured: true, approved: true, views: 601, saves: 55,
        landlordId: landlord1.id,
        images: { create: [
          { url: 'https://picsum.photos/seed/studio4a/800/600' },
          { url: 'https://picsum.photos/seed/studio4b/800/600' },
        ]},
      },
    }),
    prisma.property.create({
      data: {
        title: 'Shared Room for Male Students — Athurugiriya',
        description: 'Budget-friendly shared room for 2 male students. Neat and clean environment with shared bathroom and common kitchen. The landlord lives on the same premises ensuring security.',
        price: 6500, priceUnit: 'monthly', type: 'SHARED', area: 'Athurugiriya',
        address: '3rd Lane, New Road, Athurugiriya',
        nearbyLandmarks: JSON.stringify(['Athurugiriya Junction', 'Supermarket', 'Pharmacy']),
        amenities: JSON.stringify(['WiFi', 'Shared Kitchen', 'Shared Bathroom', 'Water 24/7', 'Ceiling Fan']),
        furnished: true, gender: 'MALE', occupancy: 'DOUBLE', bathrooms: 1,
        availableFrom: new Date('2024-03-05'), contactName: 'Chaminda Silva',
        contactPhone: '0777654321',
        verified: true, featured: false, approved: true, views: 188, saves: 12,
        landlordId: landlord2.id,
        images: { create: [{ url: 'https://picsum.photos/seed/shared5a/800/600' }]},
      },
    }),
  ]);

  await prisma.enquiry.create({
    data: {
      propertyId: properties[0].id,
      tenantId: tenant1.id,
      message: "Hi, is this room still available? I'm a 2nd year student at SLIIT.",
      status: 'NEW',
    },
  });

  await prisma.savedProperty.create({
    data: { userId: tenant1.id, propertyId: properties[0].id },
  });

  console.log(`Seeded ${properties.length} properties, 3 users, 1 enquiry.`);
  console.log('Demo logins:');
  console.log('  Landlord: rajitha@roomlanka.lk / password123');
  console.log('  Tenant:   ashan@roomlanka.lk / password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
