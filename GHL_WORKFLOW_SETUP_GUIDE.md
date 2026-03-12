# GoHighLevel Workflow Setup Guide
## Jesse by ENDevo — 4-Tier Email Nurture Sequences

**Prepared for:** Team ENDevo  
**Last updated:** March 2026  
**Handover contact:** Ask Nermeen for GHL login credentials

---

## Overview

Every time someone completes the Jesse Digital Readiness Quiz, the system automatically:
1. Creates or updates their contact in GHL
2. Applies 4 tags to their contact record
3. One of those tags is their tier tag — **this is what triggers the workflow**

The 4 tier tags sent by the system:
- `Jesse Tier: Starting Fresh`
- `Jesse Tier: Getting Clarity`
- `Jesse Tier: On Your Way`
- `Jesse Tier: Peace Champion`

You need to build **one workflow per tier** = 4 workflows total.

Each workflow sends **4 emails over 7 days**.

---

## Workflow Email Schedule (Same for All 4 Tiers)

| Step | Timing | Purpose |
|------|--------|---------|
| Email 1 | Immediately when tag is added | Welcome + direct them to open their PDF |
| Email 2 | 2 days later | First action step — one thing to do now |
| Email 3 | 5 days after Email 2 (Day 5) | Second focus area — keep momentum |
| Email 4 | 2 days after Email 3 (Day 7) | Celebrate + ENDevo next step CTA |

---

## Part 1 — GHL Workflow Setup (Step-by-Step)

### How to Build ONE Workflow (Repeat x4 for Each Tier)

---

### Step 1 — Open Automations

1. Log in to GoHighLevel at `app.gohighlevel.com`
2. In the left sidebar, click **Automation**
3. Click the **Workflows** tab at the top
4. Click the orange **+ New Workflow** button (top right)
5. Choose **Start from Scratch**
6. Give the workflow a name: `Jesse — Getting Clarity Sequence` (or whichever tier)
7. Click **Create Workflow**

---

### Step 2 — Set the Trigger

1. Click the **+ Add New Trigger** box at the top of the canvas
2. In the search box, type: `tag`
3. Select **Contact Tag**
4. Under **Filters**, click **Add Filter**
5. Set it to:
   - **Tag** → **Added**
   - Tag name: `Jesse Tier: Getting Clarity` *(change this per tier)*
6. Click **Save Trigger**

> **Important:** Each workflow uses a different tag. Do not mix them up.
> - Workflow 1 trigger tag: `Jesse Tier: Starting Fresh`
> - Workflow 2 trigger tag: `Jesse Tier: Getting Clarity`
> - Workflow 3 trigger tag: `Jesse Tier: On Your Way`
> - Workflow 4 trigger tag: `Jesse Tier: Peace Champion`

---

### Step 3 — Add Email 1 (Immediate)

1. Click the **+** button below the trigger
2. Select **Send Email**
3. Click **+ New Email** (or **Create New**)
4. **Subject line:** Copy from the email copy section below for this tier
5. **From name:** `Jesse · ENDevo`
6. **From email:** `hello@endevo.life`
7. In the email body, paste the HTML or plain text from the email copy section below  
   *(Use the GHL email builder — drag in a Text block and paste the copy)*
8. Use these merge tags in the body wherever you see `{{first_name}}`:
   - First Name: `{{contact.first_name}}`
   - Email: `{{contact.email}}`
9. Click **Save**
10. Back on the workflow canvas, click **Save Action**

---

### Step 4 — Add Wait (2 Days)

1. Click **+** below the Email 1 action
2. Select **Wait**
3. Set it to: **2 Days**
4. Click **Save Action**

---

### Step 5 — Add Email 2

1. Click **+** below the Wait step
2. Select **Send Email**
3. Click **+ New Email**
4. Enter the subject and body for Email 2 from the copy section below
5. Click **Save** → **Save Action**

---

### Step 6 — Add Wait (3 Days)

1. Click **+** below Email 2
2. Select **Wait**
3. Set it to: **3 Days**
4. Click **Save Action**

---

### Step 7 — Add Email 3

1. Click **+** below the Wait
2. Select **Send Email** → **+ New Email**
3. Enter subject and body for Email 3
4. Click **Save** → **Save Action**

---

### Step 8 — Add Wait (2 Days)

1. Click **+** below Email 3
2. Select **Wait**
3. Set it to: **2 Days**
4. Click **Save Action**

---

### Step 9 — Add Email 4

1. Click **+** below the Wait
2. Select **Send Email** → **+ New Email**
3. Enter subject and body for Email 4
4. Click **Save** → **Save Action**

---

### Step 10 — Publish the Workflow

1. At the top right of the workflow canvas, toggle the workflow from **Draft** → **Published**
2. Confirm when prompted
3. ✅ Done — this workflow is now live

---

### Step 11 — Repeat for All 4 Tiers

Go back to Automation → Workflows → + New Workflow and repeat the above steps for each tier, changing:
- The workflow name
- The trigger tag
- The email subject lines and body copy (use the correct tier's copy below)

---

## Part 2 — Email Copy

Use the copy below for each tier's 4 emails.  
Replace `{{contact.first_name}}` with the GHL merge tag.  
Replace `[YOUR ENDEVO LINK]` with the real ENDevo website URL before going live.

---

---

# TIER 1 — STARTING FRESH (Score 0–34)

*Tone: Warm, gentle, zero judgment. This person feels overwhelmed. Small wins only.*

---

## Email 1 — Immediate (Day 0)

**Subject:** Your Digital Readiness Score is in, {{contact.first_name}}

---

Hi {{contact.first_name}},

I just got your results — and I want you to know something straight away:

**There is no wrong place to start. You've already done the hardest part.**

You showed up. You answered the questions. That matters more than your score.

Your Digital Readiness Score is on its way to your inbox attached as a personalised 7-Day Action Plan PDF. Open it when you have 5 minutes of quiet. You don't have to do everything at once — not even close.

Here's the one thing I want you to take away from today:

> **Write down 3 things.** The login for your email. Your phone passcode. Where your most important document lives. Just those 3. That's it for today.

Three things. That's your whole job right now.

I'll check in with you in a couple of days with one simple next step.

With you every step,
**Jesse · ENDevo**

---

*Not sure where your PDF is? Check your spam folder and search for "Jesse." Still can't find it? Reply to this email and we'll sort it out.*

---

## Email 2 — Day 2

**Subject:** One tiny step that changes everything, {{contact.first_name}}

---

Hi {{contact.first_name}},

How are those 3 things going? Even just thinking about them counts as progress.

Today I want to give you one more tiny step — something that takes less than 10 minutes and will protect you more than almost anything else:

**Set up a password manager.**

I know that sounds technical. It isn't. A password manager is just a secure digital notebook that remembers all your passwords so you (and one trusted person) can find them when needed.

**Here's how to start:**

1. Download **Bitwarden** — it's free: `bitwarden.com`
2. Create an account with your email
3. Add your top 3 most important logins (email, bank, phone provider)
4. Write your Bitwarden master password on a piece of paper and give it to your trusted person

That's it. You don't need to add everything at once.

One app. Three logins. You're already ahead of most people.

See you on Day 5,
**Jesse · ENDevo**

---

## Email 3 — Day 5

**Subject:** The conversation that matters most

---

Hi {{contact.first_name}},

You've done something this week that most people never do. You took stock.

Today's step is the most human one of all:

**Tell someone where things are.**

Not a lawyer. Not a formal meeting. Just one person you trust — a partner, a sibling, a close friend — and a 5-minute conversation that sounds something like:

> *"Hey, if anything ever happened to me, my email is at [email address] and my phone passcode is [passcode]. I've started writing my passwords down in Bitwarden."*

That's the whole conversation.

It doesn't have to be more than that. But that conversation — those 30 seconds — could save your loved ones weeks of stress and heartbreak.

You don't have to have everything sorted. You just have to give them a starting point.

Can you have that conversation before the weekend?

I'll be back in 2 days with one last message — and something exciting from ENDevo.

Yours,
**Jesse · ENDevo**

---

## Email 4 — Day 7

**Subject:** Look how far you've come 🌱

---

Hi {{contact.first_name}},

Seven days ago you didn't know where to start.

Today you:
- Know what your Digital Readiness Score is
- Have (or are starting) a password manager
- Have taken steps toward telling someone where things are

**That is not nothing. That is everything.**

The Starting Fresh stage isn't a label — it's a launchpad. And you've officially launched.

If you want to go further — to really get your digital life sorted in a way that protects your family and gives you genuine peace of mind — ENDevo exists exactly for this.

**[Visit ENDevo →]([YOUR ENDEVO LINK])**

We help everyday people build a complete digital legacy plan — at their own pace, without the overwhelm.

You've shown you're ready. The door is open.

So proud of you,
**Jesse · ENDevo**

---

---

# TIER 2 — GETTING CLARITY (Score 35–59)

*Tone: Encouraging, practical. This person is aware but hasn't acted. Make it feel urgent but not scary.*

---

## Email 1 — Immediate (Day 0)

**Subject:** Your Digital Readiness Score is in, {{contact.first_name}}

---

Hi {{contact.first_name}},

Your results are in — and honestly? You're in a really interesting position.

You know more than most people. You've thought about this. But the gap between knowing and acting? That's exactly what your 7-Day Plan is designed to close.

Your personalised PDF is attached to this email. Open it. It's built specifically around your answers — your specific gaps, your specific domain scores.

Here's what I want you to focus on first:

> **Set up a password manager this week.** Not tomorrow. This week.

If you're over 50 logins with no central system, a password manager is the single highest-leverage thing you can do. It creates a foundation that everything else builds on.

Start with **Bitwarden** (free) or **1Password** ($3/month). Add your email, bank, and streaming accounts first.

I'll be back in 2 days with your next step.

Let's get this sorted,
**Jesse · ENDevo**

---

*Can't find your PDF? Check your spam folder or search for "Jesse." Reply to this email if you need help.*

---

## Email 2 — Day 2

**Subject:** The one thing to do today

---

Hi {{contact.first_name}},

Quick check-in: how's the password manager going?

Today's task pairs perfectly with it:

**Set up a Legacy Contact on your Apple or Google account.**

This is the person who can access your phone's data if something happens to you. It takes about 3 minutes.

**On iPhone:**
Settings → [Your Name] → Sign-In & Security → Legacy Contact → Add Legacy Contact

**On Android (Google):**
myaccount.google.com → Data & Privacy → Make a plan for your account → Choose someone

Set it up. Add one trusted person. Done.

This isn't morbid — it's responsible. It's the same energy as having home insurance. You hope you never need it, but you're glad it's there.

Two tasks down. See you on Day 5.

Jesse

---

## Email 3 — Day 5

**Subject:** Have you had "the conversation" yet?

---

Hi {{contact.first_name}},

Here's a question I want you to sit with for a moment:

*If something happened to you today — not your documents, not your passwords — but you, right now — does the person closest to you know what you'd want?*

Not legal documents. Not a will. Just a conversation.

**Your task for today:** Have one honest 10-minute conversation with someone you trust. Tell them:
- Where your important logins are (or will be, once the password manager is set up)
- What you'd want them to do with your social media accounts
- Where your most important physical documents live

You don't need to have it all figured out. You just need to start the conversation.

This is what digital readiness actually looks like — not just apps and passwords, but people who know what to do.

Back in 2 days for your final message.

Jesse

---

## Email 4 — Day 7

**Subject:** You've got clarity. Now let's build on it. 💡

---

Hi {{contact.first_name}},

You started this week in the Getting Clarity tier. That means you were aware, but action hadn't quite caught up with awareness.

After this week, that's changed.

You've moved from knowing to doing. From thinking about it to actually starting. And that shift — that's the whole game.

If you want to go from Getting Clarity to full Peace of Mind, ENDevo can take you there.

**[Explore ENDevo →]([YOUR ENDEVO LINK])**

We work with people exactly like you — digitally aware, ready to act, wanting a complete solution that doesn't require being tech-savvy.

You've done the hard part. We'll handle the rest.

With clarity and care,
**Jesse · ENDevo**

---

---

# TIER 3 — ON YOUR WAY (Score 60–84)

*Tone: Affirming but focused. They're doing well — help them close the remaining gaps before they become problems.*

---

## Email 1 — Immediate (Day 0)

**Subject:** Good news — you're already ahead. Here's how to finish the job.

---

Hi {{contact.first_name}},

Your score puts you in the top tier of digital readiness awareness. Genuinely — most people who take this quiz score much lower.

But here's the honest truth: **the gaps you still have are the ones that matter most in a crisis.**

Your personalised 7-Day Plan (attached to this email) maps out exactly what's left to close. It's built around your specific answers, not generic advice.

Here's your headline gap to address this week:

> **Make sure someone else can get in, not just you.**

You've probably got a password manager. You've probably got 2FA on some accounts. But does one trusted person have what they'd need to manage your digital life if you couldn't?

That's where most people in your tier stall — and it's the one thing that makes all the other preparation actually count.

Let's close it,
**Jesse · ENDevo**

---

*PDF in your spam? Search for "Jesse" in your email. Reply to this email if you need us to resend it.*

---

## Email 2 — Day 2

**Subject:** The 20-minute 2FA sweep

---

Hi {{contact.first_name}},

Today's task: a 2FA sweep.

You've probably enabled two-factor authentication on some accounts. Today, let's make sure the critical ones are covered.

**Check these accounts — 2FA should be ON for all of them:**
- [ ] Primary email (Gmail, Outlook, Apple)
- [ ] Online banking / financial apps
- [ ] Facebook / Instagram / LinkedIn
- [ ] iCloud or Google account
- [ ] Any account with payment details saved

For each one that's missing 2FA:
1. Go to Security or Account Settings
2. Find "Two-Factor Authentication" or "Two-Step Verification"
3. Enable it using an authenticator app (Google Authenticator or Authy — not SMS if you can help it)

This sweep takes about 20 minutes and closes one of the most common ways digital accounts are compromised after a death or emergency.

Check it off the list.

Jesse

---

## Email 3 — Day 5

**Subject:** Your digital legacy contact — have you set one?

---

Hi {{contact.first_name}},

Quick question: if you went into hospital tomorrow and were unreachable for a week — who would manage your digital accounts?

Not "who would try" — but who actually has the access and knowledge to do it?

**Your task today:**

1. Open your password manager (or wherever your logins live)
2. Export a secure copy — or write a clear summary of what exists and where
3. Put that document somewhere your trusted person can find it — a shared folder, a sealed envelope, a printed sheet in a fireproof box

Then tell that person it exists and where to find it.

This is called a **Digital Legacy Document** — and it's the difference between a manageable situation and a months-long nightmare for your family.

You're already on your way. This is what finishing looks like.

See you in 2 days for the final check-in.

Jesse

---

## Email 4 — Day 7

**Subject:** You're almost there. One last step. ✅

---

Hi {{contact.first_name}},

On Your Way isn't a consolation prize — it means you've done the work most people haven't even started.

This week you've tightened your 2FA, thought seriously about your legacy contact, and made a plan for what happens if you're unreachable.

The final step — when you're ready — is to formalize it all.

**ENDevo helps you build a complete Digital Legacy Plan** — a structured, secure, shareable document that covers every account, every platform, and every person who needs to know what to do.

**[See how it works →]([YOUR ENDEVO LINK])**

You're not starting from zero. You're arriving at the finish line.

Proud of how far you've come,
**Jesse · ENDevo**

---

---

# TIER 4 — PEACE CHAMPION (Score 85–100)

*Tone: Respectful, peer-to-peer. This person is ahead of the curve. Don't be patronising — position them as a leader.*

---

## Email 1 — Immediate (Day 0)

**Subject:** You're in rare company, {{contact.first_name}} 🏆

---

Hi {{contact.first_name}},

Your score puts you in the top percentile of everyone who has taken the Jesse quiz.

You've done the work. You have a password manager. You've thought about legacy contacts. You know what your digital footprint looks like.

That is genuinely rare. Well done.

Your 7-Day Plan PDF is attached — but for you, it's less about catching up and more about **maintenance and elevation**. A review routine that makes sure your careful setup doesn't quietly drift out of date.

Here's your one reminder for today:

> **When did you last audit your legacy contact setup?** Apple and Google legacy contacts need to be reviewed when your life changes — new relationships, moved contacts, updated phone numbers.

Take 5 minutes today to verify it's still pointing to the right person with the right access.

You're in a great position. Let's keep it that way.

Jesse

---

*Your PDF is attached to this email — open it for your personalised 7-day review plan.*

---

## Email 2 — Day 2

**Subject:** Your quarterly digital review — have you set one?

---

Hi {{contact.first_name}},

Here's the thing about digital readiness: it's not a one-time task. It's a quarterly habit.

Passwords change. Accounts get added. Legacy contacts move. Platforms update their policies.

**Your task today:** Schedule a recurring 30-minute calendar block called "Digital Review" every 3 months.

In that block, you'll:
- Open your password manager and remove any dead accounts
- Check your legacy contacts are still current
- Verify 2FA is enabled on any new accounts
- Update your Digital Legacy Document if anything has changed

That's it. 30 minutes, four times a year.

The people who stay in the Peace Champion tier aren't the ones who did it once — they're the ones who keep it fresh.

Set the calendar invite today.

Jesse

---

## Email 3 — Day 5

**Subject:** The person who needs to know what you know

---

Hi {{contact.first_name}},

You've put a lot of work into your digital preparedness. But here's a question:

**Have you briefed your trusted person — not just given them access, but actually walked them through it?**

Giving someone the key to a vault isn't the same as showing them what's inside and how to use it.

**Your task for today:**

Plan a 30-minute conversation with your designated legacy contact where you walk them through:
1. Where to find your password manager and how to use it
2. What your most critical accounts are (email, banking, social media)
3. What you'd want done with each one
4. Where your Digital Legacy Document lives

This doesn't need to be a heavy conversation. Frame it as:

> *"I've been doing some digital housekeeping and I want to make sure you know where everything is — just in case."*

They'll be relieved. Not scared. This is a gift, not a burden.

See you for the final message in 2 days.

Jesse

---

## Email 4 — Day 7

**Subject:** You're a Peace Champion. Now help someone else get there. 🏆

---

Hi {{contact.first_name}},

You've spent this week doing what most people will never do — reviewing, updating, and strengthening a digital plan that actually works.

That's worth something. And I have a request.

**Think of one person in your life who would score much lower on this quiz.**

A parent. A sibling. A friend who's always meant to "sort their digital stuff out."

Send them this link and tell them Jesse helped you. That's the whole ask.

You don't need to explain digital legacy planning or talk about mortality. Just:

> *"I did this quiz and it was really useful — thought of you immediately."*

One message. One person. That's how this spreads.

And when they're ready to go beyond the quiz — to build a full plan with support — ENDevo is here.

**[Share ENDevo →]([YOUR ENDEVO LINK])**

Thank you for being exactly the kind of person who takes this seriously. We need more of you.

With deep respect,
**Jesse · ENDevo**

---

---

## Part 3 — Quick Reference Checklist

Use this checklist to confirm all 4 workflows are set up correctly before going live.

### Workflow Checklist

**Workflow 1 — Starting Fresh**
- [ ] Trigger tag: `Jesse Tier: Starting Fresh`
- [ ] Email 1 set up and saved (immediate)
- [ ] Wait 2 days added
- [ ] Email 2 set up and saved
- [ ] Wait 3 days added
- [ ] Email 3 set up and saved
- [ ] Wait 2 days added
- [ ] Email 4 set up and saved
- [ ] Workflow published (not in Draft)

**Workflow 2 — Getting Clarity**
- [ ] Trigger tag: `Jesse Tier: Getting Clarity`
- [ ] Email 1 set up and saved (immediate)
- [ ] Wait 2 days added
- [ ] Email 2 set up and saved
- [ ] Wait 3 days added
- [ ] Email 3 set up and saved
- [ ] Wait 2 days added
- [ ] Email 4 set up and saved
- [ ] Workflow published (not in Draft)

**Workflow 3 — On Your Way**
- [ ] Trigger tag: `Jesse Tier: On Your Way`
- [ ] Email 1 set up and saved (immediate)
- [ ] Wait 2 days added
- [ ] Email 2 set up and saved
- [ ] Wait 3 days added
- [ ] Email 3 set up and saved
- [ ] Wait 2 days added
- [ ] Email 4 set up and saved
- [ ] Workflow published (not in Draft)

**Workflow 4 — Peace Champion**
- [ ] Trigger tag: `Jesse Tier: Peace Champion`
- [ ] Email 1 set up and saved (immediate)
- [ ] Wait 2 days added
- [ ] Email 2 set up and saved
- [ ] Wait 3 days added
- [ ] Email 3 set up and saved
- [ ] Wait 2 days added
- [ ] Email 4 set up and saved
- [ ] Workflow published (not in Draft)

---

## Part 4 — Testing a Workflow Before Going Live

Before publishing each workflow, test it with a real email address:

1. In GHL → Contacts → **+ New Contact**
2. Add a test contact with your own email
3. Manually add the tag: `Jesse Tier: Getting Clarity` (or whichever tier you're testing)
4. Go to **Automation → Workflows** and watch the contact move through the workflow
5. Check your inbox — Email 1 should arrive within 60 seconds
6. To test the full sequence quickly: in the workflow, temporarily change the Wait steps to 1 minute, confirm all emails arrive, then change them back to 2 days / 3 days before publishing

---

## Part 5 — Merge Tags Reference

Use these exact GHL merge tags in your email copy:

| What you want | GHL Merge Tag |
|---------------|---------------|
| First name | `{{contact.first_name}}` |
| Full name | `{{contact.full_name}}` |
| Email address | `{{contact.email}}` |
| Phone number | `{{contact.phone}}` |
| Current date | `{{now \| date: "MMMM d, yyyy"}}` |

---

## Part 6 — From Name & Email Settings

Set these the same on every single email across all 4 workflows:

- **From Name:** `Jesse · ENDevo`
- **From Email:** `hello@endevo.life`
- **Reply-To:** `hello@endevo.life`

This creates consistency — every email in the nurture sequence feels like it's coming from the same person.

---

## Part 7 — Things to Update Before Going Live

Before publishing the workflows:

1. **Replace `[YOUR ENDEVO LINK]`** in every Email 4 with the real ENDevo website URL
2. **Add the ENDevo logo** to your GHL email templates (upload to GHL Media Library first: Settings → Media Library → Upload)
3. **Verify the sending domain** is authenticated in GHL (Settings → Email Services → Domain Setup) — this prevents emails going to spam
4. **Test each workflow** using the testing steps in Part 4 above

---

*Questions? Contact Nermeen — she has the GHL credentials and can walk you through any steps.*
