INSERT INTO categories (name, color, icon, kind) VALUES
  ('Sin categoría', '#999999', 'Tag', 'expense'),
  ('Transporte', '#e74c3c', 'Car', 'expense'),
  ('Comida', '#27ae60', 'Utensils', 'expense'),
  ('Hogar', '#8e44ad', 'Home', 'expense'),
  ('Salario', '#2ecc71', 'Coins', 'income'),
  ('Freelance', '#3498db', 'Laptop', 'income')
ON CONFLICT DO NOTHING;

INSERT INTO transactions (description, amount, type, date, category_id)
SELECT 'Uber ida al trabajo', 2500, 'expense', CURRENT_DATE - INTERVAL '3 days', id
FROM categories WHERE name='Transporte' AND kind='expense' LIMIT 1;

INSERT INTO transactions (description, amount, type, date, category_id)
SELECT 'Almuerzo restaurante', 6200, 'expense', CURRENT_DATE - INTERVAL '2 days', id
FROM categories WHERE name='Comida' AND kind='expense' LIMIT 1;

INSERT INTO transactions (description, amount, type, date, category_id)
SELECT 'Pago mensual salario', 1200000, 'income', CURRENT_DATE - INTERVAL '5 days', id
FROM categories WHERE name='Salario' AND kind='income' LIMIT 1;

INSERT INTO transactions (description, amount, type, date, category_id)
SELECT 'Proyecto freelance web', 300000, 'income', CURRENT_DATE - INTERVAL '1 day', id
FROM categories WHERE name='Freelance' AND kind='income' LIMIT 1;
