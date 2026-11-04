const prettify = (name) =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export async function fetchGithubRepos(username) {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: "application/vnd.github+json" } }
  );

  if (res.status === 404) throw new Error("GitHub user not found");
  if (res.status === 403) throw new Error("GitHub limit reached, try again in a bit");
  if (!res.ok) throw new Error("Couldn't reach GitHub");

  const repos = await res.json();

  return repos
    .filter((r) => !r.fork)
    .map((r) => ({
      githubRepoId: r.id,
      title: prettify(r.name),
      summary: r.description ?? "",
      techStack: r.topics?.length ? r.topics : r.language ? [r.language] : [],
      links: { github: r.html_url, demo: r.homepage || "" },
      startDate: r.created_at?.slice(0, 7) ?? null,
      endDate: null,
      stars: r.stargazers_count,
    }));
}