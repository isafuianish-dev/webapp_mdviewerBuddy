# SQL Cheat Sheet

A detailed, professional-grade reference for SQL, grouped by task. Examples use standard ANSI SQL; where a major database (MySQL, PostgreSQL, SQL Server, SQLite) does something differently, it's called out inline.

**Conventions used below:** angle brackets like `<table>` mark a placeholder. Keywords are written in upper case purely as a readability convention — SQL itself is case-insensitive for keywords.

---

## Querying Data

### SELECT, WHERE, ORDER BY, LIMIT

`SELECT` retrieves rows from one or more tables. `WHERE` filters rows before they're returned. `ORDER BY` sorts the result set. `LIMIT` (or its equivalents) caps how many rows come back — essential when exploring a large table.

```sql
SELECT * FROM employees;                         -- every column, every row
SELECT first_name, last_name FROM employees;       -- specific columns only

SELECT * FROM employees
WHERE department = 'Engineering';

SELECT * FROM employees
ORDER BY hire_date DESC;                            -- newest first
ORDER BY last_name ASC, first_name ASC;               -- multi-column sort

SELECT * FROM employees LIMIT 10;                       -- Postgres/MySQL/SQLite
SELECT TOP 10 * FROM employees;                          -- SQL Server
SELECT * FROM employees FETCH FIRST 10 ROWS ONLY;          -- ANSI standard / Oracle

SELECT DISTINCT department FROM employees;                  -- unique values only
```

### Aliases

`AS` renames a column or table in the result set (or for readability within the query itself). Table aliases become mandatory once a query joins more than one table with overlapping column names.

```sql
SELECT first_name AS given_name, last_name AS surname
FROM employees AS e;

SELECT e.first_name, d.name AS department_name
FROM employees AS e
JOIN departments AS d ON e.department_id = d.id;
```

---

## Filtering & Operators

### Comparison and logical operators

```sql
SELECT * FROM orders WHERE total > 100;
SELECT * FROM orders WHERE status <> 'cancelled';        -- not equal (also !=)
SELECT * FROM orders WHERE total >= 50 AND total <= 200;
SELECT * FROM orders WHERE status = 'pending' OR status = 'processing';
SELECT * FROM orders WHERE NOT status = 'cancelled';
```

### BETWEEN, IN, LIKE, NULL

`BETWEEN` is inclusive on both ends. `IN` checks membership in a list (or subquery). `LIKE` does pattern matching with `%` (any number of characters) and `_` (exactly one). `NULL` represents "unknown" and can never be compared with `=` — it requires `IS NULL`/`IS NOT NULL`.

```sql
SELECT * FROM orders WHERE total BETWEEN 50 AND 200;

SELECT * FROM employees WHERE department IN ('Engineering', 'Design', 'Product');
SELECT * FROM employees WHERE department NOT IN ('Sales', 'Support');

SELECT * FROM customers WHERE email LIKE '%@gmail.com';    -- ends with
SELECT * FROM customers WHERE last_name LIKE 'Mc%';           -- starts with
SELECT * FROM customers WHERE phone LIKE '555-___-____';        -- fixed-length pattern

SELECT * FROM employees WHERE manager_id IS NULL;                -- top of the org chart
SELECT * FROM employees WHERE manager_id IS NOT NULL;
```

---

## Joins

Joins combine rows from two or more tables based on a related column. Getting joins right is mostly about knowing which rows survive when there's no match.

### INNER JOIN

Returns only rows that have a matching row in both tables. The most common join, and the implicit meaning of a bare `JOIN`.

```sql
SELECT e.first_name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;
```

### LEFT JOIN (LEFT OUTER JOIN)

Returns every row from the left table, plus matching rows from the right table — unmatched right-side columns come back as `NULL`. Use this to find "everything, plus related data if it exists" (e.g., all customers, including ones with zero orders).

```sql
SELECT c.name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;

-- Find customers with no orders at all:
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
```

### RIGHT JOIN and FULL JOIN

`RIGHT JOIN` is the mirror image of `LEFT JOIN` (everything from the right table). `FULL JOIN` (a.k.a. `FULL OUTER JOIN`) keeps unmatched rows from both sides. MySQL has no native `FULL JOIN` — emulate it with a `UNION` of a `LEFT JOIN` and a `RIGHT JOIN`.

```sql
SELECT o.id, c.name
FROM orders o
RIGHT JOIN customers c ON o.customer_id = c.id;

SELECT c.name, o.id
FROM customers c
FULL JOIN orders o ON c.id = o.customer_id;
```

### CROSS JOIN and self-join

`CROSS JOIN` pairs every row of one table with every row of another (the Cartesian product) — rarely what you want on real data, but useful for generating combinations. A self-join joins a table to itself, typically to compare rows or walk a hierarchy (e.g., employee → manager).

```sql
SELECT s.name, c.name
FROM sizes s
CROSS JOIN colors c;                        -- every size/color combination

SELECT e.first_name AS employee, m.first_name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

---

## Aggregation

### Aggregate functions

`COUNT`, `SUM`, `AVG`, `MIN`, and `MAX` collapse many rows into a single value. `COUNT(*)` counts rows; `COUNT(column)` counts non-`NULL` values in that column; `COUNT(DISTINCT column)` counts unique non-`NULL` values.

```sql
SELECT COUNT(*) FROM orders;
SELECT COUNT(DISTINCT customer_id) FROM orders;
SELECT SUM(total) FROM orders WHERE status = 'completed';
SELECT AVG(total) FROM orders;
SELECT MIN(total), MAX(total) FROM orders;
```

### GROUP BY and HAVING

`GROUP BY` buckets rows that share a value and lets aggregate functions run per bucket instead of over the whole table. `HAVING` filters those buckets after aggregation — the aggregate equivalent of `WHERE`, which can only filter individual rows before grouping.

```sql
SELECT department, COUNT(*) AS headcount
FROM employees
GROUP BY department;

SELECT customer_id, SUM(total) AS lifetime_value
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 1000                       -- only high-value customers
ORDER BY lifetime_value DESC;

-- WHERE filters rows before grouping; HAVING filters groups after:
SELECT department, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= '2020-01-01'
GROUP BY department
HAVING AVG(salary) > 80000;
```

---

## Subqueries & CTEs

### Subqueries

A query nested inside another query, usable anywhere an expression, table, or list is expected. A **scalar subquery** returns one value; a subquery in `IN`/`EXISTS` returns a set; a subquery in `FROM` acts as a temporary table (a "derived table").

```sql
-- Scalar subquery in WHERE
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Subquery as a derived table
SELECT department, avg_salary
FROM (
  SELECT department, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
) AS dept_averages
WHERE avg_salary > 75000;

-- Correlated subquery: references the outer query, runs once per outer row
SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department = e.department
);
```

### EXISTS

Tests whether a subquery returns any rows at all — often faster than `IN` for large sets because it can stop at the first match instead of materializing the whole list.

```sql
SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 500
);

SELECT c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);                                                       -- customers with zero orders
```

### CTEs (WITH)

A Common Table Expression names a subquery so it can be referenced (once or more than once) later in the statement — mainly for readability, and required for recursive queries.

```sql
WITH high_value_customers AS (
  SELECT customer_id, SUM(total) AS lifetime_value
  FROM orders
  GROUP BY customer_id
  HAVING SUM(total) > 1000
)
SELECT c.name, h.lifetime_value
FROM high_value_customers h
JOIN customers c ON c.id = h.customer_id
ORDER BY h.lifetime_value DESC;

-- Recursive CTE: walk a manager -> report chain
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees
  WHERE manager_id IS NULL                              -- anchor: the top of the chart
  UNION ALL
  SELECT e.id, e.name, e.manager_id, oc.depth + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id              -- recursive step
)
SELECT * FROM org_chart ORDER BY depth, name;
```

---

## Set Operations

Combine the results of two `SELECT` statements that return the same number of columns with compatible types.

```sql
SELECT city FROM customers
UNION
SELECT city FROM suppliers;                     -- combined, duplicates removed

SELECT city FROM customers
UNION ALL
SELECT city FROM suppliers;                       -- combined, duplicates kept (faster)

SELECT product_id FROM current_inventory
INTERSECT
SELECT product_id FROM discontinued_list;            -- rows present in both

SELECT product_id FROM all_products
EXCEPT                                                  -- MINUS in Oracle
SELECT product_id FROM discontinued_list;                -- rows in the first, not the second
```

---

## Data Modification

### INSERT

```sql
INSERT INTO employees (first_name, last_name, department)
VALUES ('Ada', 'Lovelace', 'Engineering');

INSERT INTO employees (first_name, last_name, department) VALUES
  ('Grace', 'Hopper', 'Engineering'),
  ('Alan', 'Turing', 'Research');                    -- multi-row insert

INSERT INTO employee_archive (id, first_name, last_name)
SELECT id, first_name, last_name FROM employees WHERE terminated = TRUE;  -- insert from a query
```

### UPDATE

Always pair `UPDATE` with a `WHERE` clause unless you genuinely intend to touch every row — an `UPDATE` with no `WHERE` rewrites the whole table.

```sql
UPDATE employees
SET department = 'Platform Engineering'
WHERE department = 'Engineering' AND team = 'Infra';

UPDATE orders
SET status = 'shipped', shipped_at = CURRENT_TIMESTAMP
WHERE id = 4821;
```

### DELETE

Same rule as `UPDATE`: no `WHERE` means every row goes. `TRUNCATE` is a faster alternative for wiping an entire table (it resets identity counters and typically can't be rolled back the same way, depending on the database).

```sql
DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2023-01-01';
TRUNCATE TABLE staging_import;                      -- fast, whole-table wipe
```

### Upsert (INSERT ... ON CONFLICT / MERGE)

Insert a row, or update it if a conflicting key already exists. Syntax varies significantly by database.

```sql
-- PostgreSQL / SQLite
INSERT INTO settings (user_id, theme)
VALUES (42, 'dark')
ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme;

-- MySQL
INSERT INTO settings (user_id, theme) VALUES (42, 'dark')
ON DUPLICATE KEY UPDATE theme = VALUES(theme);

-- SQL Server / ANSI standard MERGE
MERGE INTO settings AS target
USING (SELECT 42 AS user_id, 'dark' AS theme) AS src
ON target.user_id = src.user_id
WHEN MATCHED THEN UPDATE SET theme = src.theme
WHEN NOT MATCHED THEN INSERT (user_id, theme) VALUES (src.user_id, src.theme);
```

---

## Table & Schema Definition

### CREATE TABLE and constraints

```sql
CREATE TABLE employees (
  id            INTEGER PRIMARY KEY,
  first_name    VARCHAR(50) NOT NULL,
  last_name     VARCHAR(50) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  department_id INTEGER,
  salary        DECIMAL(10, 2) DEFAULT 0 CHECK (salary >= 0),
  hire_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  FOREIGN KEY (department_id) REFERENCES departments (id)
);
```

- **PRIMARY KEY** — uniquely identifies each row; implies `NOT NULL` and `UNIQUE`.
- **FOREIGN KEY** — enforces that a column's value must exist in another table's referenced column, preserving referential integrity.
- **UNIQUE** — no two rows may share the same value in that column.
- **NOT NULL** — the column can never be left empty.
- **DEFAULT** — the value used when an `INSERT` doesn't specify the column.
- **CHECK** — an arbitrary boolean condition every row must satisfy.

### ALTER TABLE and DROP

```sql
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
ALTER TABLE employees DROP COLUMN phone;
ALTER TABLE employees RENAME COLUMN department_id TO dept_id;
ALTER TABLE employees ALTER COLUMN salary SET DEFAULT 50000;   -- Postgres/SQL Server syntax
ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary >= 0);

DROP TABLE employee_archive;
DROP TABLE IF EXISTS employee_archive;               -- no error if it doesn't exist
```

---

## Indexes & Views

### CREATE INDEX

An index speeds up lookups and joins on a column at the cost of extra storage and slightly slower writes (the index has to be maintained on every `INSERT`/`UPDATE`/`DELETE`). Index columns you filter, join, or sort on frequently.

```sql
CREATE INDEX idx_employees_department ON employees (department_id);
CREATE UNIQUE INDEX idx_employees_email ON employees (email);
CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);  -- composite index
DROP INDEX idx_employees_department;
```

### CREATE VIEW

A view is a saved query that behaves like a read-only (or sometimes updatable) virtual table — useful for encapsulating a complex join or for restricting which columns/rows a group of users can see.

```sql
CREATE VIEW active_employees AS
SELECT id, first_name, last_name, department_id
FROM employees
WHERE terminated = FALSE;

SELECT * FROM active_employees WHERE department_id = 3;

DROP VIEW active_employees;
```

---

## Transactions

A transaction groups multiple statements into a single all-or-nothing unit: either every statement's effect is kept (`COMMIT`) or none of them are (`ROLLBACK`). This is what keeps a multi-step operation (like transferring money between two accounts) from leaving data half-changed if something fails partway through.

```sql
BEGIN;                                     -- or START TRANSACTION in MySQL

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;                                       -- make both changes permanent
-- or:
ROLLBACK;                                       -- undo both changes

-- Savepoints let you roll back part of a transaction:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SAVEPOINT before_credit;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
ROLLBACK TO SAVEPOINT before_credit;       -- undo just the credit, keep the debit
COMMIT;
```

---

## Window Functions

Unlike `GROUP BY`, window functions compute a value across a set of related rows ("the window") without collapsing them into one output row — each input row keeps its own row in the result, plus a new computed column.

```sql
-- Rank employees by salary within each department
SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rank_with_gaps,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_no_gaps
FROM employees;

-- Running total of sales, ordered by date
SELECT order_date, total,
  SUM(total) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- Compare each row to the previous/next one
SELECT order_date, total,
  LAG(total)  OVER (ORDER BY order_date) AS previous_total,
  LEAD(total) OVER (ORDER BY order_date) AS next_total
FROM orders;
```

- **ROW_NUMBER()** gives every row a unique, sequential number.
- **RANK()** gives tied rows the same rank, then skips the next rank number.
- **DENSE_RANK()** gives tied rows the same rank, without skipping.
- **PARTITION BY** restarts the calculation for each group, similar to `GROUP BY` but without collapsing rows.

---

## Useful Functions

### String functions

```sql
SELECT UPPER(name), LOWER(email) FROM customers;
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;   -- or `first_name || ' ' || last_name` in Postgres/SQLite
SELECT TRIM('  padded  ');
SELECT LENGTH(email) FROM customers;                  -- CHAR_LENGTH in some databases
SELECT SUBSTRING(phone, 1, 3) FROM customers;
SELECT REPLACE(phone, '-', '') FROM customers;
```

### Date/time functions

```sql
SELECT CURRENT_DATE, CURRENT_TIMESTAMP;
SELECT * FROM orders WHERE order_date >= CURRENT_DATE - INTERVAL '30 days';  -- Postgres
SELECT DATEADD(day, -30, GETDATE());                                          -- SQL Server
SELECT DATE_SUB(NOW(), INTERVAL 30 DAY);                                        -- MySQL
SELECT EXTRACT(YEAR FROM order_date) AS order_year FROM orders;
```

### Conditional expressions

```sql
SELECT name,
  CASE
    WHEN salary >= 100000 THEN 'Senior'
    WHEN salary >= 60000 THEN 'Mid'
    ELSE 'Junior'
  END AS level
FROM employees;

SELECT COALESCE(nickname, first_name) AS display_name FROM employees;  -- first non-NULL value
SELECT NULLIF(total_discount, 0) FROM orders;                             -- NULL if the two args are equal
```

---

## Quick Task Reference

- **Get everything from a table:** `SELECT * FROM <table>;`
- **Filter rows:** `WHERE <condition>`
- **Combine two related tables, keep only matches:** `INNER JOIN`
- **Combine two tables, keep everything from one side:** `LEFT JOIN`
- **Count/sum/average per group:** `GROUP BY` + aggregate function
- **Filter on an aggregate result:** `HAVING`
- **Reuse a subquery by name:** `WITH <name> AS (...)`
- **Add row numbers or running totals without collapsing rows:** a window function with `OVER (...)`
- **Insert a row or update it if it already exists:** `ON CONFLICT` / `ON DUPLICATE KEY` / `MERGE`
- **Make several statements succeed or fail together:** `BEGIN ... COMMIT` / `ROLLBACK`
- **Speed up a slow lookup:** `CREATE INDEX` on the filtered/joined column
