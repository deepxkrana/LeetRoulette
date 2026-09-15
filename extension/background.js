const GRAPHQL_URL = "https://leetcode.com/graphql/";
const PAGE_SIZE = 20;
const REQUEST_DELAY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCsrfToken() {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: "https://leetcode.com", name: "csrftoken" }, (cookie) => {
      resolve(cookie ? cookie.value : null);
    });
  });
}

async function graphqlRequest(query, variables, csrfToken) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrftoken": csrfToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

let isSyncing = false;
let syncStatus = { type: "IDLE" }; // types: IDLE, PROGRESS, COMPLETE, ERROR

function broadcastStatus() {
  chrome.runtime.sendMessage(syncStatus).catch(() => {
    // Ignore errors when sending to popup if it's closed
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_SYNC_STATUS") {
    sendResponse(syncStatus);
    return;
  }

  if (request.action === "START_SYNC") {
    if (isSyncing) return; // Prevent duplicate syncs
    isSyncing = true;
    syncStatus = { type: "SYNC_PROGRESS", percent: 0, detail: "Starting..." };
    broadcastStatus();

    startSyncProcess().catch(err => {
      console.error(err);
      isSyncing = false;
      syncStatus = { type: "SYNC_ERROR", error: err.message };
      broadcastStatus();
    });
  }
});

async function startSyncProcess() {
  const csrfToken = await getCsrfToken();
  if (!csrfToken) {
    throw new Error("Could not find LeetCode login token. Are you logged in?");
  }

  const SUBMISSION_LIST_QUERY = `
    query submissions($offset: Int!, $limit: Int!) {
      submissionList(offset: $offset, limit: $limit) {
        hasNext
        submissions { title titleSlug statusDisplay timestamp }
      }
    }
  `;

  const acceptedBySlug = new Map();
  let offset = 0;
  let hasNext = true;
  let page = 0;

  syncStatus = { type: "SYNC_PROGRESS", percent: 5, detail: "Fetching submissions..." };
  broadcastStatus();

  while (hasNext) {
    page++;
    syncStatus = { type: "SYNC_PROGRESS", percent: 10, detail: `Fetching submissions page ${page}...` };
    broadcastStatus();
    const data = await graphqlRequest(SUBMISSION_LIST_QUERY, { offset, limit: PAGE_SIZE }, csrfToken);
    const { submissions, hasNext: next } = data.submissionList;

    for (const sub of submissions) {
      if (sub.statusDisplay !== "Accepted") continue;
      const tsSeconds = Number(sub.timestamp);
      const existing = acceptedBySlug.get(sub.titleSlug);
      if (!existing || tsSeconds < existing.timestamp) {
        acceptedBySlug.set(sub.titleSlug, {
          title: sub.title,
          titleSlug: sub.titleSlug,
          timestamp: tsSeconds,
        });
      }
    }

    hasNext = next;
    offset += PAGE_SIZE;
    await sleep(REQUEST_DELAY_MS);
  }

  const uniqueSlugs = Array.from(acceptedBySlug.values());
  
  if (uniqueSlugs.length === 0) {
    chrome.storage.local.set({ leetroulette_user_data: [] }, () => {
      isSyncing = false;
      syncStatus = { type: "SYNC_COMPLETE", count: 0 };
      broadcastStatus();
    });
    return;
  }

  syncStatus = { type: "SYNC_PROGRESS", percent: 60, detail: "Loading metadata database..." };
  broadcastStatus();

  let problemsBySlug = new Map();
  try {
    const masterListRes = await fetch("https://leetroulette.vercel.app/data/all_problems.json");
    if (masterListRes.ok) {
      const allProblems = await masterListRes.json();
      problemsBySlug = new Map(allProblems.map((p) => [p.slug, p]));
    }
  } catch (err) {
    console.warn("Failed to fetch master problem list:", err);
  }

  const results = [];
  const QUESTION_DATA_QUERY = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId title titleSlug difficulty
        topicTags { name }
      }
    }
  `;

  for (let i = 0; i < uniqueSlugs.length; i++) {
    const sub = uniqueSlugs[i];
    
    // First try our instant database
    const p = problemsBySlug.get(sub.titleSlug);
    if (p) {
      results.push({
        questionId: p.questionId,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        topics: p.topics,
        leetcode_url: p.leetcode_url,
        date_solved: new Date(sub.timestamp * 1000).toISOString(),
        personal_note: "",
        pattern: "",
        times_shown: 0,
        last_shown: null,
      });
      continue;
    }

    // If not found in our database (e.g. brand new LeetCode problem), fallback to slow GraphQL
    const percent = 60 + Math.floor(((i + 1) / uniqueSlugs.length) * 35);
    syncStatus = { 
      type: "SYNC_PROGRESS", 
      percent, 
      detail: `Fetching missing details for ${sub.titleSlug}...` 
    };
    broadcastStatus();

    try {
      const data = await graphqlRequest(QUESTION_DATA_QUERY, { titleSlug: sub.titleSlug }, csrfToken);
      const q = data.question;
      if (q) {
        results.push({
          questionId: q.questionId,
          title: q.title,
          slug: q.titleSlug,
          difficulty: q.difficulty,
          topics: q.topicTags.map((t) => t.name),
          leetcode_url: `https://leetcode.com/problems/${q.titleSlug}/`,
          date_solved: new Date(sub.timestamp * 1000).toISOString(),
          personal_note: "",
          pattern: "",
          times_shown: 0,
          last_shown: null,
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch details for ${sub.titleSlug}:`, err);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  syncStatus = { type: "SYNC_PROGRESS", percent: 98, detail: "Saving data..." };
  broadcastStatus();
  
  chrome.storage.local.set({ leetroulette_user_data: results }, () => {
    isSyncing = false;
    syncStatus = { type: "SYNC_COMPLETE", count: results.length };
    broadcastStatus();
  });
}
