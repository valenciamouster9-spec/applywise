# ApplyWise

A job search toolkit: track your applications, see how your search is going, and match your CV to a job ad.

## Features
- **Tracker:** log applications with company, role, date and status
- **Dashboard:** total applications, response rate, interview rate, and charts by status and by week
- **Assistant:** compare a CV with a job ad (match score, matched and missing skills) and generate a cover letter draft from a template

## Tech stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js and Express
- Tests: Node's built-in test runner
- Storage: browser localStorage (applications stay on the user's own device)

## How to run locally
1. Clone this repository
2. Run `npm install`
3. Run `node server.js`
4. Open http://localhost:3000

## Run the tests
```
node --test
```

## Project structure
```
server.js         Express app setup
routes/api.js     API endpoints
services/         Analytics, job matcher and cover letter logic
tests/            Automated tests
public/           Frontend (HTML, CSS, JavaScript)
```

## Notes
The job-ad matcher uses keyword matching against a built-in skills list. It is rule-based, not AI.
