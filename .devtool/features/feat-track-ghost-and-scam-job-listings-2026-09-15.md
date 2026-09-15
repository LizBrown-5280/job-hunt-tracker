---
id: "feat-track-ghost-and-scam-job-listings-2026-09-15"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-09-15T15:51:54.811Z"
modified: "2026-09-15T16:14:14.313Z"
completedAt: null
labels: []
order: "a2"
---
# Feat: Track Ghost and Scam Job Listings

I want a way to add a job listing that is a potential Ghost or Scam listing.  I think on the position form we can have a section that contains  buttons for Ghost listing and Scam listing. \
\
This is just some thoughts on what will happen. If a better way exist then let's explore your ideas.

On the positions page let's add a new section which will cover vetting out the position. It needs to include:\\

- date of posting
- If the website for the company exist (checkbox)
- If the position has been found on the company's career page if one exist (checkbox)
- If it matches what was listed on the referring site (checkbox)
- a small note section

I want to also be sure to mark where the position was applied for and where it was fround from.

When one of the buttons is clicked a confirmation popup will show:\
   a message will tell the use to make sure a few things are populated before proceeding. I think the title, company, data the position was posted (this is a tell) would be good to capture. Maybe there would be some other items if you think so.  They should go back and fill out some of this info before proceeding.\
    AND a small textbox to allow the user to provide more info on why they think the position is a ghost or a scam.\
\
    If confirmed\
        then the  new ghost/scam DB will receive the position title, date position was posted, and if the button was for the ghosed position or the scam position and date clicked and the position data is archived.\
    If canceled\
        then nothing happens

This new DBs data will need to be listed a new page titled "Ghosted/Scam Positions" gotten to from a new link in the left nav bar at the bottom called Ghosted/Scams.  Each item in the list should be allowed to be deleted.

I also think that the company should be marked.  On the page for the company it should have notifacation section that lists all positions related to the company that have been marked as Ghosted or Scam.  It should list the position's title, posted date, wheither marked as ghost or scam etc.  Let's link the item to the item located on the new ghosted/scam page, though I don't think it will provide any more information, but it does provide a way to delete the item if needed.\\

---

I want to provide tool tips for each type next to the name in the popup, on the company page, and the Ghosted/Scam page.\
\
Let's save this text in a file that contains other text if we have one created, if not let's create a file for the purpose of saving text and set them to `const`  to be exported out.\
\
What are Ghost Jobs?

Ghost jobs are online job postings for positions that do not actually exist or that a company has no immediate intention of filling.

- **Resume collection:** Companies keep listings active to build a talent pipeline for future openings.
- **Image projection:** Businesses post fake openings to project an illusion of growth, strength, and success to investors or competitors.
- **Placating current staff:** Overworked employees are sometimes led to believe help is on the way so they feel less replaceable or overwhelmed.
- **Outdated ads:** Employers simply forget to take down roles that have already been filled.

---

What are Scam Job Listings?

When a fake listing is malicious rather than just misleading, it is referred to as a **job scam** or **phishing/fraudulent listing**.

- **Data theft:** Scammers post fake roles to steal personal information like Social Security numbers, dates of birth, and banking details during a fake onboarding process.
- **Financial scams:** Fraudsters send fake checks for home office equipment or ask applicants to pay processing fees and training costs upfront.
- **Smishing/Text scams:** Targets receive unsolicited text messages or WhatsApp offers for jobs they never applied for, promising high pay for little work.

---

Red Flags: How to Spot a Ghost Job vs. a Job Scam

While ghost jobs waste your time, job scams steal your identity or money. Here is how to tell them apart:

- **Ghost Job Indicators (Misleading)**
  - **Age of the post:** The listing has been active on job boards for more than **30 to 60 days**.
  - **Repetitive reposting:** The same job is constantly taken down and immediately reposted, remaining permanently available.
  - **Vague requirements:** The description uses highly generalized language that could apply to almost anyone, without listing specific project needs.
- **Job Scam Indicators (Malicious)**
  - **Communication channels:** The recruiter insists on interviewing entirely via **text message or messaging apps** (like Telegram or WhatsApp) rather than a secure video platform.
  - **Sketchy email domains:** The sender uses a free account (like `@gmail.com`) or a slight misspelling of a real company's URL (e.g., `@google-hiring.com` instead of `@google.com`).
  - **Financial red flags:** You are asked to pay upfront for **training, background checks, or equipment**, or they send you a check to deposit for home-office supplies.
  - **Too good to be true:** The role promises thousands of dollars a week for just a few hours of unstructured remote work.

---

Tips to Verify If a Company is Actively Hiring

Before spending hours tailoring your resume, use these strategies to ensure the role is legitimate and active:

- **Apply at the source:** Go directly to the company’s official website and check their **Careers page**. If the job is not listed there, it is highly likely a ghost job or a scam.
- **Check LinkedIn activity:** Search for the company's hiring managers or recruiters. Look at their **"Activity" tab** to see if they are actively posting about open roles or asking for referrals.
- **Look at the "Date Posted" filter:** When using job boards like LinkedIn or Indeed, filter your search results to show only jobs posted within the **past 24 to 48 hours**.
- **Send a networking message:** Reach out to a current employee in a similar role at that company. Ask a polite question like: *"I saw a listing for the X role and am highly interested. Is your team actively expanding right now?"*