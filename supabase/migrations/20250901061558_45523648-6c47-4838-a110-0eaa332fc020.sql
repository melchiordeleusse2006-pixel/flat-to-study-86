-- Update listings with more precise coordinates based on their actual addresses
-- Via Roberto Sarfatti, 25, Milano (Bocconi University area)
UPDATE listings 
SET lat = 45.4634, lng = 9.1895 
WHERE address_line LIKE '%Roberto Sarfatti%';

-- Viale Bligny 22, Milano (closer to city center)
UPDATE listings 
SET lat = 45.4654, lng = 9.1872
WHERE address_line LIKE '%Viale Bligny%';