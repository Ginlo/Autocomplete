// Queries for GitHub repositories and users
export const getGitHubItems = async (param) => {
  Promise.all([
    fetch(
      `https://api.github.com/search/repositories?q=${param}&sort=start&order=asc&per_page=50`
    ),
    fetch(
      `https://api.github.com/search/users?q=${param}&sort=login&order=asc&per_page=50`
    ),
  ])
    .then(async ([reposResult, usersResult]) => {
      const reposResultJson = await reposResult.json();
      const usersResultJson = await usersResult.json();
      return [reposResultJson, usersResultJson];
    })
    .then((result) => {
      // Merge repository and user lists
      return result[0].items
        .map((item) => ({
          type: "repo",
          name: item.name,
          url: item.html_url,
        }))
        .concat(
          result[1].items.map((item) => ({
            type: "user",
            name: item.login,
            url: item.html_url,
          }))
        );
    })
    // Sort items and slice the list to contain 50 items
    .then((allItems) => {
      const sortedItems = allItems
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .slice(0, 50);
      return sortedItems;
    })
    // 'handle errors'
    .catch((err) => {
      console.log(err);
    });
};
