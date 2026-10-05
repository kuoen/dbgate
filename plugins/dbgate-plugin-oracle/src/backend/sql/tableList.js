module.exports = `
select
  -- owner "schema_name",
  table_name "pure_name",
  num_rows * avg_row_len "size_bytes",
  num_rows "table_row_count",
  (select comments from all_tab_comments c where c.owner = t.owner and c.table_name = t.table_name) "object_comment"
  from
    all_tables t
  where OWNER='$owner' AND 'tables:' || TABLE_NAME =OBJECT_ID_CONDITION
`;

