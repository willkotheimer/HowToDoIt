-- Adds the SortOrder column used to persist chore image display order.
-- Safe to run multiple times. Run on BOTH the local and production databases
-- BEFORE deploying the matching API build (otherwise image reads fail).

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'SortOrder' AND Object_ID = Object_ID(N'dbo.Images')
)
BEGIN
    ALTER TABLE dbo.Images
        ADD SortOrder INT NOT NULL CONSTRAINT DF_Images_SortOrder DEFAULT 0;
END;
GO

-- Seed an initial order per chore (by existing Id) so current images stay stable.
;WITH ordered AS (
    SELECT Id,
           ROW_NUMBER() OVER (PARTITION BY ChoreId ORDER BY Id) - 1 AS rn
    FROM dbo.Images
)
UPDATE i
   SET i.SortOrder = o.rn
  FROM dbo.Images i
  JOIN ordered o ON o.Id = i.Id;
GO
