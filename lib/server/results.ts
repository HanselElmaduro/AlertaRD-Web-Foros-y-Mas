import { rows, one } from "./database";
import { FEATURES } from "../content";
export async function results() {
  const [
    participants,
    surveys,
    comments,
    province,
    featureVotes,
    configs,
    responses,
    changes,
    opinions,
    debates,
  ] = await Promise.all([
    one("SELECT COUNT(*) as n FROM participation_data"),
    one("SELECT COUNT(*) as n FROM poll_responses"),
    one(
      "SELECT COUNT(*) as n FROM forum_comments WHERE status='approved' AND official=0",
    ),
    rows(
      "SELECT p.province as name,COUNT(*) as count FROM profiles p JOIN participation_data d ON d.profile_id=p.id WHERE p.province IS NOT NULL GROUP BY p.province ORDER BY count DESC",
    ),
    rows(
      "SELECT feature_id,vote,COUNT(*) as count FROM feature_votes GROUP BY feature_id,vote",
    ),
    rows("SELECT features FROM configurations"),
    rows("SELECT answers FROM poll_responses WHERE poll_id='ciudadana-v1'"),
    rows("SELECT * FROM project_changes ORDER BY created_at DESC"),
    rows(
      "SELECT c.body,p.alias,p.province FROM forum_comments c JOIN profiles p ON p.id=c.profile_id WHERE c.status='approved' AND c.featured=1 AND c.official=0 ORDER BY c.created_at DESC LIMIT 4",
    ),
    one("SELECT COUNT(*) as n FROM forum_threads WHERE status='approved'"),
  ]);
  const selections: Record<string, number> = {};
  configs.forEach((c) =>
    JSON.parse(c.features).forEach((id: string) => {
      selections[id] = (selections[id] || 0) + 1;
    }),
  );
  const concerns: Record<string, number> = {},
    intent: Record<string, number> = {};
  responses.forEach((r) => {
    const a = JSON.parse(r.answers);
    if (a.concern) concerns[a.concern] = (concerns[a.concern] || 0) + 1;
    if (a.intent) intent[a.intent] = (intent[a.intent] || 0) + 1;
  });
  return {
    participants: participants?.n || 0,
    surveys: surveys?.n || 0,
    comments: comments?.n || 0,
    provinces: province,
    debates: debates?.n || 0,
    configurationCount: configs.length,
    features: FEATURES.map((f) => {
      const v = featureVotes.filter((v) => v.feature_id === f.id);
      return {
        id: f.id,
        title: f.title,
        yes: v.find((x) => x.vote === "yes")?.count || 0,
        no: v.find((x) => x.vote === "no")?.count || 0,
        unsure: v.find((x) => x.vote === "unsure")?.count || 0,
        selected: selections[f.id] || 0,
      };
    }),
    concerns: Object.entries(concerns).map(([name, count]) => ({
      name,
      count,
    })),
    intent: Object.entries(intent).map(([name, count]) => ({ name, count })),
    surveyBase: responses.length,
    changes,
    opinions,
    updatedAt: new Date().toISOString(),
  };
}
