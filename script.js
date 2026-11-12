const input = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const reposContainer = document.getElementById("repos");

function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function searchRepos(query) {
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name&sort=stars&order=desc&per_page=5`,
  );

  if (!res.ok) {
    throw new Error("Что-то пошло не так: " + res.status);
  }

  const data = await res.json();
  return data.items;
}

function renderSuggestions(items) {
  suggestions.replaceChildren();

  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Не найдено";
    li.className = "empty";
    suggestions.append(li);
    return;
  }

  items.forEach((repo) => {
    const li = document.createElement("li");
    li.textContent = repo.name;

    li.addEventListener("click", () => {
      addRepo(repo);
      input.value = "";
      suggestions.replaceChildren();
    });

    suggestions.append(li);
  });
}

function addRepo(repo) {
  const card = document.createElement("div");
  card.className = "repo";
  card.innerHTML = `
        <div>
            <div>Name: ${repo.name}</div>
            <div>Owner: ${repo.owner.login}</div>
            <div>Stars: ${repo.stargazers_count}</div>
        </div>
        <button class="remove" aria-label="Удалить"></button>
    `;
  reposContainer.append(card);
}
reposContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove");
  if (btn) btn.closest(".repo").remove();
});

const handleInput = debounce(async () => {
  const query = input.value.trim();

  if (!query) {
    suggestions.replaceChildren();
    return;
  }

  try {
    const items = await searchRepos(query);
    if (input.value.trim() !== query) return;
    renderSuggestions(items);
  } catch (error) {
    console.error(error);
    suggestions.replaceChildren();
  }
}, 400);

input.addEventListener("input", () => {
  if (!input.value.trim()) suggestions.replaceChildren();
  handleInput();
});
