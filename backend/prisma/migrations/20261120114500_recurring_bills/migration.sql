ALTER TABLE "Bill"
ADD COLUMN "recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "recurrenceSourceId" TEXT,
ADD COLUMN "recurrenceSkipped" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Bill_recurrenceSourceId_dueDate_key"
ON "Bill"("recurrenceSourceId", "dueDate");

ALTER TABLE "Bill"
ADD CONSTRAINT "Bill_recurrenceSourceId_fkey"
FOREIGN KEY ("recurrenceSourceId") REFERENCES "Bill"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
