/**
 * LeetRoulette - Browser Console Extractor
 * 
 * Instructions:
 * 1. Log into https://leetcode.com
 * 2. Open Developer Tools (F12 or Right Click -> Inspect)
 * 3. Go to the "Console" tab
 * 4. Paste this entire script and press Enter
 * 5. Wait for the download of "solved_problems.json" to finish!
 */

(async function extractLeetCodeData() {
  console.log("%c🚀 Starting LeetRoulette Extraction...", "color: #10b981; font-size: 16px; font-weight: bold;");

  function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "";
  }

  const CSRF = getCsrfToken();
  if (!CSRF) {
    console.error("❌ Could not find CSRF token. Are you logged into LeetCode?");
    return;
  }

  const GRAPHQL_URL = "https://leetcode.com/graphql/";
  const PAGE_SIZE = 20;
  const REQUEST_DELAY_MS = 250;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function graphqlRequest(query, variables) {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": CSRF,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    return json.data;
  }

  // Step 1: Fetch all accepted submissions
  console.log("⏳ Fetching all accepted submissions. This might take a minute...");
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

  while (hasNext) {
    page++;
    console.log(`Fetching submissions page ${page}...`);
    const data = await graphqlRequest(SUBMISSION_LIST_QUERY, { offset, limit: PAGE_SIZE });
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
  console.log(`✅ Found ${uniqueSlugs.length} unique solved problems.`);

  // Step 2: Fetch details (difficulty/topics) for each problem
  console.log("⏳ Fetching difficulties and topics for each problem...");
  const QUESTION_DATA_QUERY = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId title titleSlug difficulty
        topicTags { name }
      }
    }
  `;

  const results = [];
  for (let i = 0; i < uniqueSlugs.length; i++) {
    const sub = uniqueSlugs[i];
    if (i % 10 === 0) console.log(`Processing problem ${i + 1}/${uniqueSlugs.length}...`);

    try {
      const data = await graphqlRequest(QUESTION_DATA_QUERY, { titleSlug: sub.titleSlug });
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

  // Step 3: Trigger file download
  console.log("🎉 Done! Downloading solved_problems.json...");
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "solved_problems.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
})();
