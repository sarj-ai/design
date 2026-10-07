# DES-197 — invite-only organization access: handoff notes

Design: `/org-access` in the design lab (`src/components/mockups/org-access/`).
It answers DES-197, under INT-32, and is built to the requirements doc
[Organization access and membership](https://linear.app/sarj/document/organization-access-and-membership-f407e5d51f77)
that PLT-4476 implements. Groups come from
[Access model: roles and permissions](https://linear.app/sarj/document/access-model-roles-and-permissions-13682fbd3e46).

## Where the design departs from the DES-197 ticket

DES-197 was written before the requirements doc (20 Sep), and the two
disagree on two things. The design follows the doc, because DES-197 also asks
for the design to "match what engineering is building", and PLT-4476 builds
the doc.

1. **Approving unprompted sign-ups.** DES-197 asks for "approve or reject an
   unprompted sign-up with a matching domain". The doc removes domain-based
   joining outright ("Auto-enrolment by domain is removed, not made
   optional"), so there is no request queue to approve. A person who signs up
   without an invite sees the "No invite" screen.
2. **Domain verification.** DES-197 asks to "claim and verify a domain" and
   "allow a second org on a verified domain". The doc makes verification a
   non-goal because a domain no longer grants anything. The domain is a
   reference field when Sarj creates an organization, and two organizations
   can carry the same one with no extra step.

P5 (teams inside one org) is not designed. The doc puts it under the
Fine-grained Permissions initiative.

## What the design does

Seen as Sarj staff, on the admin Organizations page the platform already has
(`app/admin/organizations`).

- **Organizations list.** Adds an **Owner** column. An organization with no
  owner shows "No owner" with **Set owner** beside it. That row-by-row pass is
  the migration step "every existing organization gets an owner".
  **Create organization** takes name, domain (optional) and owner's email in
  one dialog. The owner gets an invite and shows as "Invited" until they
  accept. A domain another organization already uses gets a note under the
  field ("Also used by Zain KSA and Yaqoot"), not a block.
- **Set owner** picks from the organization's current members. Picking
  someone who isn't an Org Admin says they will become one, because an owner
  is an Org Admin with the owner designation.
- **Members** (one organization). Pending invites sit at the top of the same
  list, tagged Pending, so "is this person in?" has one answer. Owner is a tag
  beside the name, not a group. Members auto-enrolled before invites existed
  show "Joined by domain" under Added by.
  - **Invite member**: one email and one group (Viewer, Caller, Editor,
    Org Admin). Defaults to Viewer, the least access.
  - **Invite link**: off by default. When it's on, the dialog sets the group
    people join as and when the link expires (1, 7 or 30 days), and shows the
    link to copy.
  - **Row menu**: Make owner (Org Admins only), Remove as owner, and Remove
    from the organization (confirm). Pending invites: Resend, and Revoke with
    Undo.
- **Invited person**, outside the app: the invite (who invited them, as what,
  and the address it's for), the wrong account, an expired link, and no
  invite. "No invite" replaces today's "Create your organization" screen, and
  every state has Sign out (PROD-342).

## Acceptance criteria → where to see it

| Requirements doc criterion | Where to see it |
|---|---|
| Signing up with a matching domain grants no access | Invited person → No invite |
| Entry only through an invite or an invite link | Members → Invite member, Invite link |
| Any email can be invited, personal ones included | Members: Majed Al-Otaibi (gmail.com), hassan.k@outlook.com |
| Two organizations can carry the same domain | Organizations: Zain KSA and Yaqoot on sa.zain.com; Create organization with sa.zain.com |
| At least one owner; the last one can't be removed | Members → Fatimah's menu (disabled, with the reason); make Omar owner and it opens up |
| Sarj creates an org, sets its domain and names its owner in one flow | Organizations → Create organization |
| Invite links are off by default and expire | Members → Invite link |
| No existing user loses access in migration | Nawaf Al-Ghamdi stays, "Joined by domain"; Saudia and Al Rajhi Bank → Set owner |

## States

| State | Where |
|---|---|
| Loading | Members · loading (skeleton rows in the table's own shape) |
| Error | Members · error ("Could not load members", Try again) |
| No results | Members, search for a name that isn't there |
| Permission | Members · no access (names the group needed and who can grant it) |
| Validation | Invite member: bad address, already a member, already invited, in another organization. Create organization: name and owner's email required |
| Edge | Last owner; person in another organization (V1 is one organization per person); personal email; domain shared with another org; expired link; wrong account |

## Open questions — for the PM (Taynam Alzamel) and Kidus Asmare

1. **Where does a client Org Admin manage members?** The access model gives
   Org Admins member management for their own organization, but the client
   sidebar has no entry for it. Today `Organizations` is staff-only. The
   members table works for both audiences; the entry point needs deciding.
2. **Can an Org Admin who isn't an owner remove an owner?** The doc says an
   owner "cannot be removed by another admin". This design is the Sarj view,
   where Sarj can change owners. The client view needs that rule applied to
   the row menu.
3. **Do email invites expire?** The doc gives expiry to links only. The
   design shows when each invite was sent and offers Resend, and doesn't
   expire email invites.
4. **Default group for an invite and for the link.** The design uses Viewer
   for both. Nothing in the doc sets a default.
5. **The access model's "Removing the last Org Admin is permitted. Sarj can add
   one back"** sits next to the membership doc's "the last owner cannot be
   removed". The design applies the owner rule only. Removing the last
   non-owner Org Admin is allowed.
