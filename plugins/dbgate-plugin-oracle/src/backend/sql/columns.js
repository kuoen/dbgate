module.exports = `
select
  -- owner as "schema_name",
  table_name as "pure_name",
  column_name as "column_name",
  nullable as "is_nullable",
  data_type as "data_type",
  data_length as "char_max_length",
  data_precision as "numeric_precision",
  data_scale as "numeric_scale",
  data_default as "default_value",
  (select cc.comments from all_col_comments cc where cc.owner = av.owner and cc.table_name = av.table_name and cc.column_name = av.column_name) as "column_comment"
  FROM all_tab_columns av
  where OWNER='$owner' AND 'tables:' || TABLE_NAME =OBJECT_ID_CONDITION
order by column_id
`;