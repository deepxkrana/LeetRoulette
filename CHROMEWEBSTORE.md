# Chrome Web Store Listing — LeetRoulette Sync

> Last Updated: 2026-09-15

## Store Listing

**Extension Name** [REQUIRED]
LeetRoulette Sync

**Short Description** [REQUIRED]
Securely syncs your solved LeetCode problems directly into LeetRoulette with one click.

**Detailed Description** [REQUIRED]
LeetRoulette Sync is the official companion extension for LeetRoulette, the sleek, minimalist tool to help you pick LeetCode problems at random.

Instead of manually running console scripts to extract your solved problems, this extension does the heavy lifting for you securely in the background. With a single click, it securely fetches your completed problems directly from LeetCode and instantly pushes them into the LeetRoulette web app for you to practice.

How to use it:
1. Log into your account on leetcode.com.
2. Click the LeetRoulette Sync icon in your toolbar.
3. Click "Sync Data" and wait for the extraction to finish.
4. Click "Open LeetRoulette" to instantly jump into Custom Mode with your data.

Your data is synced directly between your browser and LeetCode. No data is sent to external servers or tracked.

**Category** [REQUIRED]
Developer Tools

**Single Purpose** [REQUIRED]
Securely fetches a user's solved problems from LeetCode and syncs them to the LeetRoulette web app.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `extension/icon128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | Take a screenshot of the popup syncing |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | Take a screenshot of the LeetRoulette web app |

### Screenshot Notes
Make sure you take at least one high-resolution screenshot (1280x800) of the extension popup open while on LeetCode.com, and another of the actual LeetRoulette application.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to temporarily save the user's solved LeetCode problems locally in the browser so they can be injected into the LeetRoulette web application. |
| `cookies` | permissions | Required to read the user's `csrftoken` cookie from leetcode.com, which is strictly necessary to authenticate the GraphQL requests to fetch their solved problems. |
| `*://leetcode.com/*` | host_permissions | Required to make secure GraphQL requests to LeetCode's servers on behalf of the user to fetch their solved problems. |

## Privacy & Data Use

### Data Collection
**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | | No |
| Health info | No | No | | No |
| Financial info | No | No | | No |
| Authentication info | Yes | No | Reads the LeetCode CSRF token to fetch solved problems. | No |
| Personal communications | No | No | | No |
| Location | No | No | | No |
| Web history | No | No | | No |
| User activity | Yes | No | Fetches the user's history of solved LeetCode problems to sync with the app. | No |
| Website content | No | No | | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
*(You will need to create a simple privacy policy on your GitHub repository or a Notion page stating that the extension only reads LeetCode data locally and does not transmit it to any external servers.)*

## Developer Info

**Publisher Name** [REQUIRED]
deepxkrana

**Contact Email** [REQUIRED]
*(Your email address)*

**Support URL / Email** [RECOMMENDED]
https://github.com/deepxkrana/LeetRoulette/issues
