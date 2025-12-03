-- Add logo and banner URL fields to SellerProfile
ALTER TABLE "SellerProfile" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "bannerUrl" TEXT;
