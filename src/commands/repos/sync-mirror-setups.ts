import { Gitlab } from "@gitbeaker/rest";
import { Args, Command, Flags } from "@oclif/core";
import assert from "assert";
import { addDays, format, isBefore } from "date-fns";
import { App } from "octokit";
import * as config from "../../config.js";
import { GithubTargetRepo } from "../../typegen/types.generated.js";

export default class ReposSyncMirrorSetups extends Command {
  static override description = "configure mirroring setups on GitLab, GitHub";
  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override flags = {
    "dry-run": Flags.boolean({ char: "n" }),
  };

  static override args = {
    "mirror-manager-keys-name": Args.string({
      description: "name to give the deploy keys",
      default: process.env["MIRROR_MANAGER_KEYS_NAME"],
    }),
    "mirror-manager-self-rotate-token-target-var": Args.string({
      description: "name of CI/CD variable to store self-rotating tokens in",
      default: process.env["TARGET_SELF_ROTATION_TOKEN_VARIABLE"],
    }),
    "mirror-manager-self-project-id": Args.string({
      description: "GitLab project ID to store self-rotating tokens in",
      default: process.env["MIRROR_MANAGER_SELF_PROJECT_ID"],
    }),

    "gitlab-token": Args.string({
      description: "GitLab API Access Token",
      default: process.env["GITLAB_TOKEN"],
    }),
    "gitlab-host": Args.url({
      description: "GitLab Hostname",
      default: async () => URL.parse(process.env["GITLAB_HOST"]!)!,
    }),

    "github-org-name": Args.string({ default: process.env["GITHUB_ORG_NAME"]! }),
    "github-app-private-key": Args.string({ default: process.env["GITHUB_APP_PRIVATE_KEY"] }),
    "github-app-id": Args.integer({ default: async () => parseInt(process.env["GITHUB_APP_ID"]!) }),
    "github-app-install-id": Args.integer({
      default: async () => parseInt(process.env["GITHUB_APP_INSTALL_ID"]!),
    }),
  };

  /**
   * For each repository, do the following steps:
   * - Check whether mirroring repository is active.
   * - If it is active, check that it is successful. If so, done.
   * - If it fails, (potentially remove mirroring config and) treat as inactive.
   * - Register a new mirroring repository in GitLab with appropriate values over SSH.
   * - Create or get existing GitHub repository. Set to private by default.
   * - Use the public key to register a non-expiring SSH Deploy Key in GitHub.
   * - Trigger mirroring procedure, check whether it is successful.
   */
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ReposSyncMirrorSetups);

    const cfg = config.loadMirrorConfig();

    const dryRun: boolean = flags["dry-run"];

    if (dryRun) {
      this.logToStderr("Running a dry-run sync on the repositories! Not actually doing changes!");
    }

    const getRotatedGitlab = async () => {
      const gitlabApi = new Gitlab({
        host: args["gitlab-host"].toString(),
        token: args["gitlab-token"],
      });

      const tokenInfo = await gitlabApi.PersonalAccessTokens.show({ tokenId: "self" });
      const tokenExpiresSoon =
        tokenInfo.expires_at && isBefore(tokenInfo.expires_at, addDays(new Date(), 13));

      if (
        tokenExpiresSoon &&
        !!args["mirror-manager-self-rotate-token-target-var"] &&
        !!args["mirror-manager-self-project-id"]
      ) {
        if (dryRun) {
          this.logToStderr("[dry-run action] rotating token!");
        } else {
          this.logToStderr("rotating token!");
          const rotatedToken = await gitlabApi.PersonalAccessTokens.rotate("self", {
            expiresAt: format(addDays(new Date(), 365), "yyyy-MM-dd"),
          });

          const freshGitlabApi = new Gitlab({
            host: args["gitlab-host"].toString(),
            token: rotatedToken.token,
          });

          await freshGitlabApi.ProjectVariables.edit(
            args["mirror-manager-self-project-id"],
            args["mirror-manager-self-rotate-token-target-var"],
            rotatedToken.token,
          );

          this.logToStderr("rotated token and updated CI/CD variable!");
          return freshGitlabApi;
        }
      }

      return gitlabApi;
    };

    const gitlabApi = await getRotatedGitlab();

    const glProjects = await gitlabApi.Projects.all({
      membership: true,
    });

    const orgName = args["github-org-name"];
    const githubApp = new App({
      appId: args["github-app-id"],
      privateKey: args["github-app-private-key"]!,
    });

    const octokit = await githubApp.getInstallationOctokit(args["github-app-install-id"]);

    const ghOrgRepos = await octokit.rest.repos.listForOrg({
      org: orgName,
    });

    const ghOrgReposByName = Object.fromEntries(ghOrgRepos.data.map((it) => [it.name, it]));
    const projects = config.flattenProjects(cfg.mirroringConfig.groups);

    const knownProjects: { [key: string]: GithubTargetRepo } = Object.fromEntries(
      projects.map((p) => [p.name_with_namespace, p.project.githubTargetRepo]),
    );

    for (const glProject of glProjects) {
      if (!(glProject.path_with_namespace in knownProjects)) {
        //this.logToStderr("Unknown project", glProject.path_with_namespace, "skipping");
        continue;
      }

      const ghCorrespondingRepo = knownProjects[glProject.path_with_namespace];

      this.logToStderr(
        `${glProject.name_with_namespace} -> ${ghCorrespondingRepo.name} (${ghCorrespondingRepo.visibility})`,
      );

      let ghMirrorRepo: { name: string; description: string | null } =
        ghOrgReposByName[ghCorrespondingRepo.name];
      if (ghMirrorRepo === undefined) {
        this.logToStderr(
          "Need to create repo for project, creating repository with name",
          ghCorrespondingRepo,
          "in the org",
          orgName,
        );
        if (dryRun) {
          this.logToStderr("[dry-run action] creating repo, skipping to next project.");
          continue;
        } else {
          const createResp = await octokit.rest.repos.createInOrg({
            name: ghCorrespondingRepo.name,
            org: orgName,
            visibility: ghCorrespondingRepo.visibility ?? "private",
            description: glProject.description ?? undefined,
          });
          ghMirrorRepo = createResp.data;
        }
      } else if (
        ghOrgReposByName[ghCorrespondingRepo.name].visibility !== ghCorrespondingRepo.visibility
      ) {
        this.logToStderr(
          "Updating repo visibility to",
          ghCorrespondingRepo.visibility,
          "from",
          ghOrgReposByName[ghCorrespondingRepo.name].visibility,
        );

        if (dryRun) {
          this.logToStderr("[dry-run action] updating repo visibility");
        } else {
          await octokit.rest.repos.update({
            owner: orgName,
            repo: ghMirrorRepo.name,
            visibility: ghCorrespondingRepo.visibility,
          });
        }
      }

      const ghTargetDescription = [glProject.description ?? "", "Mirror from source GitLab"].join(
        " -- ",
      );

      if (ghTargetDescription !== ghMirrorRepo.description) {
        this.logToStderr(
          "Updating gh repo description to",
          glProject.description,
          "from",
          ghMirrorRepo.description,
        );
        if (dryRun) {
          this.logToStderr("[dry-run action] updating repo description");
        } else {
          octokit.rest.repos.update({
            owner: orgName,
            repo: ghMirrorRepo.name,
            description: ghTargetDescription,
          });
        }
      }

      const glGitHubTargetMirrorUrl = `ssh://git@github.com/${orgName}/${ghCorrespondingRepo.name}.git`;
      const glMirrors = await gitlabApi.ProjectRemoteMirrors.all(glProject.id);
      const glGitHubMirrors = glMirrors.filter(
        (it) => it.url.toLowerCase() === glGitHubTargetMirrorUrl.toLowerCase(),
      );
      if (glGitHubMirrors.length > 1) {
        const names = glGitHubMirrors.map((it) => it.url).join();
        this.error(
          `Repository ${glProject.name} has registered conflicting mirrors for same target URL: ${names}`,
          { exit: 1 },
        );
      }

      let mirrorId: number;
      if (glGitHubMirrors.length == 1) {
        //this.logToStderr("Found key", glGitHubMirrors[0]);
        mirrorId = glGitHubMirrors[0].id;
      } else {
        this.logToStderr("No mirror found for", glProject.name, "creating new mirror");
        if (dryRun) {
          this.logToStderr("[dry-run action] creating mirror, skipping to next project");
          continue;
        } else {
          const response = await gitlabApi.ProjectRemoteMirrors.createPushMirror(
            glProject.id,
            glGitHubTargetMirrorUrl,
            {
              enabled: true,
              keepDivergentRefs: false,
              onlyProtectedBranches: false,
              authMethod: "ssh_public_key",
              host_keys: cfg.mirroringConfig.githubKnownHostKeys,
            } as any,
          );
          mirrorId = response.id;
        }
      }

      const glPublicKeyResp = await gitlabApi.requester.get(
        `projects/${glProject.id}/remote_mirrors/${mirrorId}/public_key`,
      );
      assert(
        glPublicKeyResp.status === 200,
        `Unable to get public key for mirror ${glProject.name_with_namespace} (${glProject.id}) with mirror id ${mirrorId}`,
      );
      assert(
        !!glPublicKeyResp.body &&
        typeof glPublicKeyResp.body === "object" &&
        "public_key" in glPublicKeyResp.body,
      );
      const glPublicKey = glPublicKeyResp.body["public_key"];
      assert(typeof glPublicKey === "string");

      this.logToStderr(
        "Updating mirror with host keys for",
        glProject.name_with_namespace,
        "with mirror id",
        mirrorId,
      );
      if (dryRun) {
        this.logToStderr("[dry-run action] updating mirror with host keys");
      } else {
        const glRemoteMirrorPutResp = await gitlabApi.requester.put(
          `projects/${glProject.id}/remote_mirrors/${mirrorId}`,
          {
            body: {
              id: mirrorId,
              host_keys: cfg.mirroringConfig.githubKnownHostKeys,
            },
          },
        );
        assert(glRemoteMirrorPutResp.status === 200, "Failed to update mirror with host keys");
      }

      const ghDeployKeys = await octokit.rest.repos.listDeployKeys({
        repo: ghMirrorRepo.name,
        owner: orgName,
      });

      const registeredMirrorManagerKeys = ghDeployKeys.data.filter(
        (it) =>
          //it.title == args['mirror-manager-keys-name'],
          it.key.split(" ").slice(0, 2).join("") === glPublicKey.split(" ").slice(0, 2).join(""),
      );
      if (registeredMirrorManagerKeys.length > 0) {
        //this.logToStderr("Key is already registered, skipping to next project");
        continue;
      }

      this.logToStderr("Registering new deploy key");
      if (dryRun) {
        this.logToStderr("[dry-run action] registering new deploy key");
      } else {
        await octokit.rest.repos.createDeployKey({
          repo: ghMirrorRepo.name,
          owner: orgName,
          title: args["mirror-manager-keys-name"],
          key: glPublicKey,
          read_only: false,
        });
      }

      this.logToStderr("Triggering sync");
      if (dryRun) {
        this.logToStderr("[dry-run action] triggering sync");
      } else {
        await gitlabApi.ProjectRemoteMirrors.sync(glProject.id, mirrorId);
      }
    }
  }
}
