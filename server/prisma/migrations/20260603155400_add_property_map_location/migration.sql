-- Add optional exact Google Maps location fields for listings.
ALTER TABLE "Property" ADD COLUMN "latitude" REAL;
ALTER TABLE "Property" ADD COLUMN "longitude" REAL;
ALTER TABLE "Property" ADD COLUMN "googleMapUrl" TEXT;
