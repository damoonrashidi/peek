SELECT o.name,
       COUNT(1)
FROM applications a
INNER JOIN candidates c ON a.candidate_id = c.id
INNER JOIN organisations o ON c.organisation_id = o.id
GROUP BY o.name

---

SELECT o.name,
       COUNT(1)
FROM applications a
INNER JOIN candidates c ON a.candidate_id = c.id
INNER JOIN organisations o ON c.organisation_id = o.id
GROUP BY o.name

---

SELECT organisations.NAME,
       COUNT(1)
FROM   users
       INNER JOIN organisations
               ON users.organisation_id = organisations.id
GROUP  BY organisations.NAME

---

SELECT o.name,
       Date_trunc('month', a.created_at) AS month,
       Count(*)
FROM   applications a
INNER JOIN candidates c ON a.candidate_id = c.id
INNER JOIN organisations o ON c.organisation_id = o.id
WHERE  a.created_at >= '2024-01-01'
       AND a.created_at < '2025-01-01'
GROUP  BY month, o.name
ORDER  BY month ASC;


---

SELECT * FROM ads order by created_at desc limit 40
