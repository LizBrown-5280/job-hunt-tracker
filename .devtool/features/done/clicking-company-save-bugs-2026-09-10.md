---
id: "clicking-company-save-bugs-2026-09-10"
status: "done"
priority: "critical"
assignee: null
epic: null
dueDate: null
created: "2026-09-10T16:15:37.902Z"
modified: "2026-09-11T20:27:09.785Z"
completedAt: "2026-09-11T20:27:09.785Z"
labels: []
order: "Zz"
---
# BUG - Clicking Company Save Bugs

## A/C:

From the Add Journey page, if the company is missing from the Company select dropdown, which attached to the company db, the user has the ability to click "Add New Company" which takes them to the Company page where a form is presented to be used to add a new company, which is added to the company db.

When a user finishes filling in the company information (at a minimum the company names should be present) and clicks the "Save Company" button, the user should be redirected back to the referring page and that company should now show as the selected item in the Company select drop-down, if possible, otherwise the user will have to manually select it, which is acceptable.  This means the company should have been saved in the company db.

## What is actually happening:

From the Add Journey page, I click "Add New Company", I am redirected to the Add Company page, I fill out the form with at least a company name and click the "Save Company" button and this is where the issues start.

1. I am not redirected back to the referring page.  But I do see that the company was created and is being listed in the right column which is where all the companies that are in the company db show up.
   - Issue - the user was to be redirected back to the referring page.
2. If I click "Save Company" again, a second listing will show up in the right column. Every click of the save button creates a new listing on the right.
   - Issue - only one company with that exact name should ever be stored.  This is probably an oversight of the original A/Cs.  I can archive and remove one though.
3. If I manually go back to the Journeys page, that company is not listed in the Company dropdown
   - issue - we've just added it why is it not showing up as an option in the select input?
4. If I return to the Company page either by the "Add New Company Button" or by clicking Companies in the nav bar the new company is no longer showing in the right column, but it's info is now back in the form.
   - Issues - going to this page from any means should provide a empty form, which it is not AND the company is not showing up in the right column. Was it not saved to the company db?