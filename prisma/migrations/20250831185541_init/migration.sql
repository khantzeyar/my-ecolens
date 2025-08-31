-- CreateTable
CREATE TABLE "public"."CampSite" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "CampSite_pkey" PRIMARY KEY ("id")
);
