-- Seed initial pricing configuration
INSERT INTO pricing_config (size, price, dimensions) VALUES
  ('small', 9.99, '40x40x4mm'),
  ('medium', 14.99, '60x60x5mm'),
  ('large', 19.99, '80x80x6mm')
ON CONFLICT (size) DO UPDATE SET
  price = EXCLUDED.price,
  dimensions = EXCLUDED.dimensions,
  updated_at = TIMEZONE('utc', NOW());

