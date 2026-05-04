-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "mttr" DOUBLE PRECISION,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RCA" (
    "id" TEXT NOT NULL,
    "workItemId" TEXT NOT NULL,
    "rootCauseCategory" TEXT NOT NULL,
    "fixApplied" TEXT NOT NULL,
    "preventionSteps" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RCA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkItem_componentId_idx" ON "WorkItem"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "RCA_workItemId_key" ON "RCA"("workItemId");

-- AddForeignKey
ALTER TABLE "RCA" ADD CONSTRAINT "RCA_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
