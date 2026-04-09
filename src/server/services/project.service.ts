import type { Project } from '@server/lib/db';
import { getDb, projects } from '@server/lib/db';
import { listProjectConfig, setProjectConfigValues } from '@server/services/config.service';

interface ProjectConfigResponse {
  issuePrefix: string;
  epicPrefix: string;
  commentPrefix: string;
}

interface ProjectDetails extends Project {
  config: ProjectConfigResponse;
}

interface UpdateProjectConfigInput {
  issuePrefix?: string;
  epicPrefix?: string;
  commentPrefix?: string;
}

function toProjectConfigResponse(
  config: Awaited<ReturnType<typeof listProjectConfig>>
): ProjectConfigResponse {
  return {
    issuePrefix: config.issue_prefix,
    epicPrefix: config.epic_prefix,
    commentPrefix: config.comment_prefix,
  };
}

export async function get(): Promise<ProjectDetails | null> {
  const db = getDb();
  const [result, config] = await Promise.all([db.select().from(projects), listProjectConfig()]);
  const project = result[0];

  if (!project) {
    return null;
  }

  return {
    ...project,
    config: toProjectConfigResponse(config),
  };
}

export async function updateConfig(
  input: UpdateProjectConfigInput
): Promise<ProjectConfigResponse> {
  const config = await setProjectConfigValues({
    issue_prefix: input.issuePrefix,
    epic_prefix: input.epicPrefix,
    comment_prefix: input.commentPrefix,
  });

  return toProjectConfigResponse(config);
}
