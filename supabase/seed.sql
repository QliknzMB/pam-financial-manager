-- This file contains seed data for default categories
-- Run this after a user is created to populate their default categories

-- Note: Replace 'USER_ID_HERE' with the actual user ID when running

-- Income Categories
INSERT INTO categories (user_id, name, type, is_system, sort_order) VALUES
('USER_ID_HERE', 'Salary', 'income', TRUE, 1),
('USER_ID_HERE', 'Insurance Payment', 'income', TRUE, 2),
('USER_ID_HERE', 'Tax Refund', 'income', TRUE, 3),
('USER_ID_HERE', 'Transfer In', 'income', TRUE, 4),
('USER_ID_HERE', 'Other Income', 'income', TRUE, 5);

-- Expense Categories
INSERT INTO categories (user_id, name, type, is_system, sort_order) VALUES
-- Housing
('USER_ID_HERE', 'Rent', 'expense', TRUE, 1),
('USER_ID_HERE', 'Power/Gas/Internet', 'expense', TRUE, 2),
('USER_ID_HERE', 'Water', 'expense', TRUE, 3),
('USER_ID_HERE', 'Home General', 'expense', TRUE, 4),

-- Transport
('USER_ID_HERE', 'Petrol', 'expense', TRUE, 10),
('USER_ID_HERE', 'Car Insurance', 'expense', TRUE, 11),
('USER_ID_HERE', 'Vehicle Maintenance', 'expense', TRUE, 12),

-- Food
('USER_ID_HERE', 'Groceries', 'expense', TRUE, 20),
('USER_ID_HERE', 'Dining Out', 'expense', TRUE, 21),

-- Children
('USER_ID_HERE', 'School Fees', 'expense', TRUE, 30),
('USER_ID_HERE', 'Childcare', 'expense', TRUE, 31),
('USER_ID_HERE', 'Kids Activities', 'expense', TRUE, 32),
('USER_ID_HERE', 'Kids General', 'expense', TRUE, 33),

-- Health
('USER_ID_HERE', 'Health Insurance', 'expense', TRUE, 40),
('USER_ID_HERE', 'Life Insurance', 'expense', TRUE, 41),
('USER_ID_HERE', 'Medical', 'expense', TRUE, 42),

-- Personal
('USER_ID_HERE', 'Clothing', 'expense', TRUE, 50),
('USER_ID_HERE', 'Personal Care', 'expense', TRUE, 51),

-- Financial
('USER_ID_HERE', 'Savings', 'expense', TRUE, 60),
('USER_ID_HERE', 'Investment', 'expense', TRUE, 61),
('USER_ID_HERE', 'Transfer Out', 'expense', TRUE, 62),
('USER_ID_HERE', 'Emergency Fund', 'expense', TRUE, 63),
('USER_ID_HERE', 'Banking Fees', 'expense', TRUE, 64),

-- Lifestyle
('USER_ID_HERE', 'Entertainment', 'expense', TRUE, 70),
('USER_ID_HERE', 'Travel/Holidays', 'expense', TRUE, 71),
('USER_ID_HERE', 'Subscriptions', 'expense', TRUE, 72),
('USER_ID_HERE', 'Discretionary', 'expense', TRUE, 73),

-- Other
('USER_ID_HERE', 'Family Support (SA)', 'expense', TRUE, 80),
('USER_ID_HERE', 'Uncategorized', 'expense', TRUE, 99);
