-- DATOS DEMOSTRATIVOS. NEVER RUN ON A PRODUCTION RESEARCH DATABASE.
-- Use only on a separate database. Start the app once to install the catalog first.
-- This file is deliberately NOT included in Drizzle migrations.
BEGIN;
INSERT INTO profiles (id,alias,province,role) VALUES ('DEMO-example','DEMO — Participante ficticio','Monte Plata','guest') ON CONFLICT(id) DO NOTHING;
INSERT INTO participation_data (profile_id) VALUES ('DEMO-example') ON CONFLICT(profile_id) DO NOTHING;
INSERT INTO feature_votes (id,profile_id,feature_id,vote) VALUES ('DEMO-vote','DEMO-example','gps','yes') ON CONFLICT(profile_id,feature_id) DO NOTHING;
INSERT INTO suggestions (id,profile_id,category,title,description,problem,solution,status) VALUES ('DEMO-suggestion','DEMO-example','Ideas para mejorar Alerta RD','DEMO — Confirmación accesible','DATOS DEMOSTRATIVOS: ejemplo ficticio para revisar moderación.','DEMO: activaciones involuntarias.','DEMO: confirmación configurable.','nueva') ON CONFLICT(id) DO NOTHING;
COMMIT;
