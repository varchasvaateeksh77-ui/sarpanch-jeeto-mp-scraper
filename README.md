# Sarpanch Jeeto (Madhya Pradesh) — Standalone ECI/MPSEC Scraper & Verifier (`sarpanch-jeeto-mp-scraper`)

This repository is the **standalone data ingestion, OCR parsing, and 12-check verification pipeline** for **[`varchasvaateeksh77-ui/sarpanch-jeeto-mp-app`](https://github.com/varchasvaateeksh77-ui/sarpanch-jeeto-mp-app)**.

## Two-Repository Architecture
1. **Scraper & Verifier Repo (`sarpanch-jeeto-mp-scraper`) — THIS REPO**:
   - Queries the live **Election Commission of India (ECI) Gateway API** (`https://gateway-voters.eci.gov.in/api/v1/common/districts/S12` and `/api/v1/common/acs/S12xx`) for official Madhya Pradesh (`S12`) districts and Assembly Constituencies.
   - Provides **Gemini 2.5 Flash Vision (`@google/genai`)** helpers (`src/eciClient.ts` & `src/parseOfficialPdf.ts`) to auto-solve ECI/MPSEC CAPTCHAs and extract structured Hindi voter records (`sr`, `house_no`, `name_hi`, `relative_name_hi`, `age`, `gender`, `epic`) from official Electoral Roll PDFs.
   - Runs the **79-Rule Vanshavali Family Tree Builder** and enforces the **12-Check Karpathy LLM Council Gate** (including **Zero Fake Phone Numbers**, 100% Voter Conservation, and Parent-Child Age-Gap validation).
   - **Only datasets that pass 12/12 checks** are signed with a SHA-256 hash and pushed to `sarpanch-jeeto-mp-app/data/verified_panchayats/`.
2. **Main App Repo ([`sarpanch-jeeto-mp-app`](https://github.com/varchasvaateeksh77-ui/sarpanch-jeeto-mp-app))**:
   - Consumes the verified `.json` bundles from `data/verified_panchayats/` and serves the 22-screen Sarpanch Jeeto MP web application.

## Quick Commands
```bash
# Run ECI live fetch + 12-check Council verifier and output verified JSONs:
TARGET_VERIFIED_DIR=../sarpanch-jeeto-mp-app/data/verified_panchayats npm run scrape:verify

# Parse a downloaded MPSEC / ECI Ward Voter List PDF using Gemini 2.5 Flash:
GEMINI_API_KEY=your_key npm run parse:pdf -- ./path/to/voter-roll.pdf 1
```
