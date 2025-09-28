-- CreateTable
CREATE TABLE "public"."campsite" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "openingTime" TEXT,
    "fees" TEXT,
    "forestType" TEXT,
    "tags" TEXT,
    "contact" TEXT,
    "imageUrl" TEXT,
    "activities" TEXT,

    CONSTRAINT "campsite_pkey" PRIMARY KEY ("id")
);
