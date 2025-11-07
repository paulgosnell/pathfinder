-- Helper script: Mark feedback as reviewed/fixed based on Oct 31 commit
-- Run this after applying add-feedback-tracking.sql migration

-- Mark profile save error feedback as fixed (3 reports from Oct 29-30)
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-10-31 12:33:18+00',
  triage_tier = 'tier-1-action-now',
  issue_type = 'bug',
  triage_notes = 'CRITICAL: Profile save error showing "Unknown error" at discovery completion. Root cause: Supabase error objects don''t extend Error class.',
  fixed_in_commit = '011a06e3bc8709d221441685303d92e4e3ab6421',
  fixed_at = '2025-10-31 12:33:18+00'
WHERE id IN (
  '7c304192-de18-406e-8b90-335e4dcb220d', -- Oct 29: "I'm resubmitting my details but have had another error report"
  '78b9cd85-9111-4407-b538-dafde60b0b0e', -- Oct 29: "I entered details about my kids and their circumstances. The app went to save all the details but then encountered an error"
  'e8562b8b-5fe6-41af-8588-96472fbdb684'  -- Oct 30: Rupert's discovery error (Henry, age 15-16)
);

-- Mark discovery redirect loop as fixed (1 report from Oct 28)
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-10-31 12:33:18+00',
  triage_tier = 'tier-1-action-now',
  issue_type = 'bug',
  triage_notes = 'Discovery redirect loop: Login → Discovery prompt → Returns to conversation. Root cause: Session not created until first user message.',
  fixed_in_commit = '011a06e3bc8709d221441685303d92e4e3ab6421',
  fixed_at = '2025-10-31 12:33:18+00'
WHERE id = 'b924c050-38f8-4198-9f26-d3ce331d7e05'; -- Oct 28: "I am getting a bit of a loop when I log in"

-- Mark chat startup error as needs investigation (Oct 29)
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-11-07 10:00:00+00',
  triage_tier = 'tier-2-backlog',
  issue_type = 'bug',
  triage_notes = 'Chat startup failure after profile completion: "I''m having trouble connecting right now." Needs investigation - may be related to profile save issues.',
  fixed_in_commit = NULL,
  fixed_at = NULL
WHERE id = '98f4feae-481a-403d-a08c-7169f91eed4a'; -- Oct 29: "I have managed to complete our profiles by going into the sidebar"

-- Mark session persistence issue as needs investigation (Nov 6)
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-11-07 10:00:00+00',
  triage_tier = 'tier-2-backlog',
  issue_type = 'bug',
  triage_notes = 'Session persistence: "I tried to return to an earlier conversation, but the content had gone." Need to investigate session history loading.',
  fixed_in_commit = NULL,
  fixed_at = NULL
WHERE id = '4f67d10f-26af-4860-881b-df63720b75bf'; -- Nov 6: "I tried to return to an earlier conversation, but the content had gone"

-- Mark USA content bias as backlog (Nov 6)
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-11-07 10:00:00+00',
  triage_tier = 'tier-2-backlog',
  issue_type = 'content',
  triage_notes = 'USA content bias: "Chatbot needed some guidance over pushing for UK rather than USA content." Need to add UK localization.',
  fixed_in_commit = NULL,
  fixed_at = NULL
WHERE id = '4f67d10f-26af-4860-881b-df63720b75bf'; -- Nov 6: Same feedback (USA content bias)

-- Mark age-appropriateness as backlog (Oct 31)
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-11-07 10:00:00+00',
  triage_tier = 'tier-2-backlog',
  issue_type = 'ux',
  triage_notes = 'Initial suggestions not age-appropriate for Rufus. Required user correction. Need to improve initial age filtering in strategy retrieval.',
  fixed_in_commit = NULL,
  fixed_at = NULL
WHERE id = 'd44137ed-d412-4c50-8fc9-720c12b79e75'; -- Oct 31: "There were quite a few suggestions which were a little unsuitable for Rufus"

-- Mark positive feedback as not applicable
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-11-07 10:00:00+00',
  triage_tier = 'not-applicable',
  issue_type = 'positive-feedback',
  triage_notes = 'Positive feedback - age-appropriate advice praised.'
WHERE id IN (
  'ec512678-9412-48fd-8efd-c729f6ce5dbe', -- Nov 7: "Great tips based on child age"
  '6b37956c-178c-48e4-8c6c-a5ce8013f951', -- Nov 6: "Great, fast and helpful info"
  '0bb3a5d6-164b-4bb1-8fb2-69346eead450'  -- Oct 31: "It was very quick to come to this result, and adapted well to my feedback"
);

-- Mark unclear feedback
UPDATE user_feedback
SET
  reviewed = TRUE,
  reviewed_at = '2025-11-07 10:00:00+00',
  triage_tier = 'not-applicable',
  issue_type = 'unclear',
  triage_notes = 'Unclear feedback - insufficient detail to action.'
WHERE id IN (
  '0d52d0d9-2d6b-4b02-b2ba-e68dd6f62047', -- Nov 4: "Tell me about Child"
  '96bc39dc-c40b-4ce6-b31f-aae17a46ab66'  -- Oct 27: "leve it"
);

-- Show summary of triage status
SELECT
  triage_tier,
  issue_type,
  COUNT(*) as count,
  COUNT(CASE WHEN fixed_in_commit IS NOT NULL THEN 1 END) as fixed_count
FROM user_feedback
GROUP BY triage_tier, issue_type
ORDER BY
  CASE triage_tier
    WHEN 'tier-1-action-now' THEN 1
    WHEN 'tier-2-backlog' THEN 2
    WHEN 'tier-3-future' THEN 3
    WHEN 'tier-4-wont-fix' THEN 4
    ELSE 5
  END,
  issue_type;
