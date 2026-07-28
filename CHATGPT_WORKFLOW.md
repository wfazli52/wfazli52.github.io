# ChatGPT Workflow for Building Real Technical Projects

ChatGPT can help you plan, learn, code, review, test, and document. It cannot replace the hands-on evidence. Never publish invented command output, screenshots, measurements, incidents, certifications, or results.

## 1. Create one long-running Project in ChatGPT

Name it `Data Center Technician Portfolio`. Add:

- Your current resume
- The four project pages
- Your WGU course objectives that you are permitted to share
- Sanitized job descriptions
- Your real lab notes and screenshots

Suggested Project instructions:

> Act as my data center and networking lab coach. Prioritize safety, troubleshooting discipline, accurate documentation, and beginner-friendly explanations. Never claim I completed a step unless I provide evidence. Ask me to run commands and paste the actual output. Separate facts, assumptions, and recommendations. Do not fabricate screenshots, test results, certifications, or work experience.

## 2. Planning prompt

> I am building Project 01 from my portfolio. My available equipment/software is: [LIST IT]. My current skill level is: [DESCRIBE IT]. Create a lab plan for this week with prerequisites, exact deliverables, acceptance tests, likely failure points, and a rollback step. Keep the scope achievable in [NUMBER] hours. Do not write resume bullets yet.

## 3. Tutor prompt

> Teach me [TOPIC] using this pattern: explain the mental model, give one small example, ask me one check-for-understanding question, then give me a lab exercise. Do not reveal the final lab answer until I show my attempt.

## 4. Configuration review prompt

> Review the following configuration for correctness, security, and alignment with my stated requirements. Build a table with: line/section, issue, impact, recommended change, and how I should test it. Do not assume the configuration worked. Here are the requirements: [PASTE]. Here is the configuration: [PASTE SANITIZED CONFIG].

## 5. Troubleshooting coach prompt

> I have this symptom: [SYMPTOM]. Here is the topology and recent change: [DETAILS]. Guide me using an evidence-first troubleshooting process. Ask for one observation or command output at a time. Do not jump straight to the fix and do not invent output.

## 6. Hidden incident generator

Use only after you create an approved fault catalog.

> Select one fault at random from the catalog below, but do not tell me which one. Give me only the user-visible symptoms and incident priority. Keep the hidden answer in this chat. I will report my tests and you will respond only with the realistic results that logically follow from the selected fault. After I declare recovery, reveal the fault and grade my process against the ticket template. [PASTE FAULT CATALOG]

Important: this is a simulation. Label it as simulated in the portfolio.

## 7. Documentation prompt

> Turn my raw lab notes into a technical project write-up. Preserve every fact and command exactly. Flag missing evidence with `[EVIDENCE NEEDED]`. Use these sections: objective, constraints, architecture, implementation, validation, incidents, security considerations, lessons learned, and next steps. Do not invent results. Raw notes: [PASTE NOTES].

## 8. Resume bullet prompt

> Using only the verified evidence below, draft three resume bullets for an entry-level data center technician role. Each bullet must begin with an action verb, name the system or skill, and include a concrete scope or validation result. Do not add metrics that are not present. Evidence: [PASTE COMPLETED PROJECT SUMMARY AND TEST RESULTS].

## 9. Website coding prompt for Codex

> Work in my portfolio repository. First inspect the existing files and summarize the structure. Then implement this change: [DESCRIBE CHANGE]. Preserve the no-framework static architecture, accessibility, mobile layout, and `config.js` profile system. Run local checks, list every changed file, and explain how I can manually verify the result. Do not replace real project evidence with placeholder claims.

## 10. Interview coach prompt

> Interview me for an entry-level data center technician role. Ask one question at a time. Mix hardware, networking, Linux, troubleshooting, safety, documentation, and behavioral questions. After each answer, grade technical accuracy, clarity, and evidence. Then show a stronger answer using only facts I have actually provided.

## A strong weekly ChatGPT loop

1. Ask for a small plan.
2. Build the lab yourself.
3. Paste real output when stuck.
4. Ask for a review against acceptance tests.
5. Fix failures and retest.
6. Ask ChatGPT to clean your real notes.
7. Publish evidence and explain it aloud without assistance.
