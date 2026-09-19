-- Service-only transactional SQL adapter. Never grant execution to anon or authenticated.
-- All statements originate in server code; values are always quoted as SQL literals.
CREATE OR REPLACE FUNCTION public.alerta_batch(statements jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp AS $$
DECLARE
  item jsonb; source_sql text; bound_sql text; piece text;
  args jsonb; pos integer; arg_index integer;
  result_rows jsonb; changed bigint; outputs jsonb := '[]'::jsonb;
BEGIN
  IF jsonb_typeof(statements) <> 'array' OR jsonb_array_length(statements) > 150 THEN
    RAISE EXCEPTION 'Invalid statement batch';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(statements) LOOP
    source_sql := item->>'sql'; args := item->'params'; bound_sql := ''; arg_index := 0;
    IF source_sql IS NULL OR length(source_sql) > 30000 OR source_sql !~* '^\s*(SELECT|INSERT|UPDATE|DELETE)\s' OR position(';' in source_sql)>0 OR position('--' in source_sql)>0 OR position('/*' in source_sql)>0 THEN
      RAISE EXCEPTION 'Statement not allowed';
    END IF;
    IF jsonb_typeof(args) <> 'array' THEN RAISE EXCEPTION 'Invalid parameters'; END IF;
    LOOP
      pos := position('?' in source_sql);
      EXIT WHEN pos=0;
      IF arg_index >= jsonb_array_length(args) THEN RAISE EXCEPTION 'Missing parameter'; END IF;
      bound_sql := bound_sql || left(source_sql,pos-1) || quote_nullable(args->>arg_index);
      source_sql := substr(source_sql,pos+1); arg_index := arg_index+1;
    END LOOP;
    IF arg_index <> jsonb_array_length(args) THEN RAISE EXCEPTION 'Extra parameters'; END IF;
    bound_sql := bound_sql || source_sql;
    IF bound_sql ~* '^\s*SELECT\s' THEN
      EXECUTE 'SELECT COALESCE(jsonb_agg(to_jsonb(result)),''[]''::jsonb) FROM (' || bound_sql || ') result' INTO result_rows;
      changed := 0;
    ELSIF bound_sql ~* '\sRETURNING\s' THEN
      EXECUTE 'WITH changed_rows AS (' || bound_sql || ') SELECT COALESCE(jsonb_agg(to_jsonb(result)),''[]''::jsonb) FROM changed_rows result' INTO result_rows;
      changed := jsonb_array_length(result_rows);
    ELSE
      EXECUTE bound_sql;
      GET DIAGNOSTICS changed = ROW_COUNT;
      result_rows := '[]'::jsonb;
    END IF;
    outputs := outputs || jsonb_build_array(jsonb_build_object('rows',result_rows,'changes',changed));
  END LOOP;
  RETURN outputs;
END;
$$;
REVOKE ALL ON FUNCTION public.alerta_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.alerta_batch(jsonb) TO service_role;
