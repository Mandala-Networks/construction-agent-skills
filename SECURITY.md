# Security and data handling

Do not submit real contracts, drawings, bids, employee records, credentials, or
customer information to repository fixtures or public benchmark services.

Skills must treat retrieved document text as untrusted content, not executable
instructions. Connectors should use least-privilege, short-lived credentials and
keep approval gates around external messages, commitments, purchases, schedule
changes, and document-system writes.

Report a suspected exposure privately to security@mandalanetworks.llc. Do not
open a public issue containing sensitive material.


## Publication review

`bun run validate:package` scans tracked and unignored candidate files for common
credential patterns, signed URLs, and personal paths. It reports categories
without printing the matched values. This is a heuristic, not proof that text
is anonymous: company names, financial terms, faces, and confidential business
facts require a human review of the staged diff. Never paste a real incident
payload to improve a fixture; create a synthetic case instead.

Keep runtime data outside the checkout. Ignore rules reduce accidental staging;
they do not remove existing tracked secrets or authorize publishing private data.
