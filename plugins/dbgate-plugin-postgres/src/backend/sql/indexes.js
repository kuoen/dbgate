// One row per index column (key columns, expressions and INCLUDE columns), ordered by position in the index.
// $indexKeyColumnCount is ix.indnkeyatts on PostgreSQL 11+ (INCLUDE support), ix.indnatts otherwise.
module.exports = `
SELECT
    n.nspname AS "schema_name",
    t.relname AS "table_name",
    i.relname AS "index_name",
    ix.indisunique AS "is_unique",
    am.amname AS "index_method",
    pg_catalog.pg_get_expr(ix.indpred, ix.indrelid) AS "filter_definition",
    con.contype AS "constraint_type",
    k.ordinal_position AS "ordinal_position",
    a.attname AS "column_name",
    CASE
        WHEN k.attnum = 0 THEN pg_catalog.pg_get_indexdef(ix.indexrelid, k.ordinal_position::int, true)
        ELSE NULL
    END AS "column_expression",
    (k.ordinal_position > $indexKeyColumnCount) AS "is_included",
    COALESCE((ix.indoption[(k.ordinal_position - 1)::int]::int & 1) = 1, false) AS "is_descending"
FROM pg_catalog.pg_index ix
JOIN pg_catalog.pg_class i ON i.oid = ix.indexrelid
JOIN pg_catalog.pg_class t ON t.oid = ix.indrelid
JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
JOIN pg_catalog.pg_am am ON am.oid = i.relam
LEFT JOIN pg_catalog.pg_constraint con
    ON con.conrelid = ix.indrelid
    AND con.contype IN ('p', 'u')
    AND (con.conindid = ix.indexrelid OR con.conname = i.relname)
CROSS JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ordinal_position)
LEFT JOIN pg_catalog.pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = k.attnum AND k.attnum > 0
WHERE t.relkind IN ('r', 'p')
    AND ix.indisprimary = false
    AND n.nspname != 'pg_catalog'
    AND n.nspname !~ '^_timescaledb_'
    AND ('tables:' || n.nspname || '.' || t.relname) =OBJECT_ID_CONDITION
    AND n.nspname =SCHEMA_NAME_CONDITION
ORDER BY n.nspname, t.relname, i.relname, k.ordinal_position
`;
