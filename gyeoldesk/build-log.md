# Gyeoldesk build log

Gyeoldesk (결데스크) is a bilingual Korean/English project desk for Korean construction contractors working on USFK installations. Good Neighbor Construction (GNC) is the first company using it. This log is public, so client project details, people's names, contact details and site photos are left out.

Case study: https://jvholmes87.github.io/gyeoldesk/

---

## 3 November 2026

**Releases**
- 3 production releases, all approved explicitly in chat. Each went to the preview site first.
- 2 database migrations.
- 1 new server function. Updates to two others.
- 28 automated tests (14 site, 14 backend).

### What shipped

| # | Update | What a user sees |
|---|---|---|
| 1 | **Contacts directory** | A read-only Contacts page. It lists who to contact on each project, who gets each email (To / cc), which address to send from, and what each person can approve. It's built from a tracker restructured into organizations, people and project assignments. Mobile numbers are visible to admins only. |
| 2 | **Progress photos from private Google Drive** | A project card shows the photos for that week that a named reviewer approved, to signed-in staff only. Nothing is copied to public hosting and no share links are created. |
| 3 | **Photo status line** | A short summary in standard photo-log terms: "Showing 14 of 22 photos taken this week (30 Oct–5 Nov)", why the rest aren't shown, and a note that a photo records conditions but does not confirm completion. |
| 4 | **Card navigation** | Cards open at the top. "Back to the board" returns to where you were. A ↑ button appears once you scroll. |
| 5 | **Standard labels** | 13 labels changed to standard project and software terms: Users & access, Bids & proposals, Open items, No update this week, Member / Active / Deactivated / Departed, and others. A menu item that did nothing was removed. |
| 6 | **Report parser fix** | Photo-activity tables in weekly reports were being read as payment rows. Photo sections are now kept out of the payment and public text. |

### How the photo path works

1. Each project keeps a restricted **photo manifest** in Google Drive. One row per photo records the capture date and its evidence, captions in Korean and English, verification, reviewer, review time and the approval text.
2. A photo is **released** only when it meets all of these:
   - it is verified;
   - a named reviewer approved it, with the approval recorded;
   - its capture date falls inside the reporting week;
   - it is selected for the gallery;
   - it has a Drive file.
3. An hourly **collector** (Apps Script in the company's Google account) sends two things to the database:
   - counts for every photo;
   - full details for released photos only.

   It also keeps an allow-list of released files.
4. The card asks a **members-only server function** for each image. Database row-level security decides who gets an answer. The function then calls the collector's web-app relay with a signed request that is valid for 5 minutes. The relay returns Drive's resized thumbnail, which is re-encoded, so camera metadata and location are not carried.
5. Unreleased photos contribute counts only. Their captions, links and file IDs never leave Google.

### Decisions

**D1. Photos stay in private Drive, not public hosting.**
- **First design:** copy approved photos into the site's assets.
- **Decision:** the owner ruled it out, because the site repositories are public.
- **Result:** a signed relay serving thumbnails.
- **Trade-offs:** images load a few seconds slower, and the relay is subject to Apps Script quotas, so the page loads 3 photos at a time.

**D2. Verification and approval are separate steps.**
- **Rule:** a technical check that a photo is correctly dated and captioned does not release it. A named reviewer does, and the approval text is recorded word for word.
- **Example:** an approval came in using placeholder IDs copied from an example. The system asked which photos were meant, and did not guess.

**D3. Two kinds of photo can be shown.**
- **First rule:** only frames from reports already sent to the Government.
- **Extended the same day:** frames from the company's own daily work reports may also be shown, but only in the internal gallery.
- **Unchanged:** prime-contractor and public audiences still need a sent report frame, plus their own approval.

**D4. Status counts must not overlap.**
- **Problem:** the first status line counted some photos twice, as both "historical" and "date unconfirmed".
- **Fix:** counts are now this week's photos (shown plus not shown) and other files, each counted once.

**D5. Wording follows industry terms.** Every label was checked against common construction project-management and federal contracting usage. "WAR" (Weekly Action Report) was kept because the team and its prime contractor already use it.

### Lessons learned

1. **Two AI assistants working in parallel need a re-sync step.** Claude and ChatGPT/Codex both pushed to the same branch within the hour. Every build now starts by fetching the latest branch, and the other assistant's commits are reviewed before promotion. That review kept a correct fix: the PostgREST `contains()` filter on a JSONB array needs a JSON string, not a JavaScript array.
2. **Exact approval words protect production.** A plain "I approve" did not unlock a production deploy until the owner confirmed it was meant for live. It cost one round trip and removed any doubt.
3. **Examples become inputs.** Placeholder IDs in an instruction were copied straight into a real approval. Examples now use real IDs or obviously fake ones.
4. **Single-page apps keep scroll position across hash routes.** Reset scroll when navigating, and restore it when the user returns.
5. **When the build machine can't reach an endpoint, verify from the other side.** Database rows, function logs and readback of the live files confirmed each step.
6. **Printed material is a disclosure too.** Wall posters use example images, and contact screens are kept off them.

### Next
- Team rollout beyond the first two reviewers.
- WAR outputs generated when a week is finalized.
- Projects, Bids & proposals and Warranties pages.
