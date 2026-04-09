/**
 * Generates a professional networking email draft based on contact + job context.
 * No API key required — template-based, personalized from available data.
 */

export function draftNetworkingEmail(contact, job, userProfile) {
  const userName    = userProfile?.name  || 'there'
  const firstName   = userName.split(' ')[0]
  const contactFirst = (contact.name || 'there').split(' ')[0]
  const jobTitle    = job?.title    || 'the open role'
  const company     = job?.company  || contact.company || 'your company'

  // Top 3 skills relevant to this job
  const skills = (userProfile?.skills || []).slice(0, 3).join(', ')
  const skillLine = skills
    ? `With a background in ${skills}, I believe I'd be a strong fit for the team.`
    : ''

  const conn = contact.connection || 'other'

  const subjects = {
    alumni:    `Fellow Alumni — Interested in ${jobTitle} at ${company}`,
    recruiter: `Application Follow-up: ${jobTitle} — ${firstName}`,
    referral:  `Referred by a Mutual Connection — ${jobTitle} at ${company}`,
    cold:      `Admirer of Your Work at ${company} — Quick Question`,
    friend:    `Reaching Out About ${jobTitle} at ${company}`,
    professor: `Career Advice Request — ${firstName}`,
    colleague: `Catching Up + Question About ${company}`,
    other:     `Networking Inquiry — ${jobTitle} at ${company}`,
  }

  const bodies = {
    alumni: `Hi ${contactFirst},

I hope this message finds you well! I came across your profile and saw that we share an alma mater — small world! I'm currently exploring opportunities and was really excited to find the ${jobTitle} position at ${company}.

${skillLine}

I'd love to hear about your experience on the team and any advice you might have for someone looking to join. Would you be open to a quick 15-minute chat sometime this week or next?

Thank you so much for your time — I really appreciate it!

Best,
${firstName}`,

    recruiter: `Hi ${contactFirst},

I recently applied for the ${jobTitle} role at ${company} and wanted to reach out directly to express my enthusiasm for the position. ${company}'s work really resonates with me, and I'm confident I could contribute meaningfully from day one.

${skillLine}

I'd love the chance to discuss how my background aligns with what you're looking for. Please feel free to reach out if you have any questions about my application.

Thank you for your time!

Best,
${firstName}`,

    referral: `Hi ${contactFirst},

I was given your contact by a mutual connection and encouraged to reach out. I'm very interested in the ${jobTitle} role at ${company} and would love to learn more about what it's like to work there.

${skillLine}

Would you be open to a brief 15-minute conversation? I'd be grateful for any insight you could share.

Thank you so much!

Best,
${firstName}`,

    cold: `Hi ${contactFirst},

I hope this message isn't too out of the blue! I've been following ${company}'s work and came across your profile — your path is really impressive.

I'm ${firstName}, currently exploring roles in this space, and I'm particularly excited about the ${jobTitle} position at ${company}. ${skillLine}

I know your time is valuable, so I'll keep it brief: would you be open to a 15-minute call or a quick coffee chat? I'd love to hear your perspective on the team and culture.

Totally understand if you're too busy — no pressure at all!

Best,
${firstName}`,

    friend: `Hi ${contactFirst},

Hope you're doing well! I wanted to reach out because I noticed ${company} is hiring for a ${jobTitle} role and I'm really interested. I'd love to get your honest take on the team and culture.

${skillLine}

Let me know if you'd be up for a quick chat sometime — would mean a lot!

Best,
${firstName}`,

    professor: `Dear ${contactFirst},

I hope you're doing well! I'm reaching out because I'm currently exploring career opportunities and would love your guidance. I came across the ${jobTitle} position at ${company} and am very excited about it.

${skillLine}

Would you have 15–20 minutes to connect and share your thoughts? Your advice has always been invaluable to me.

Thank you so much for your time and mentorship.

Best,
${firstName}`,

    colleague: `Hi ${contactFirst},

It's been a while — hope things are going great! I'm currently exploring new opportunities and noticed ${company} is hiring for a ${jobTitle} role. Given your experience there, I'd love to catch up and hear your perspective.

${skillLine}

Would you be up for a quick call sometime soon?

Best,
${firstName}`,

    other: `Hi ${contactFirst},

I hope this message finds you well. I'm ${firstName}, and I'm very interested in the ${jobTitle} role at ${company}. I came across your profile and thought you might be a great person to connect with.

${skillLine}

Would you be open to a brief 15-minute conversation? I'd love to learn more about your experience at ${company}.

Thank you for your time!

Best,
${firstName}`,
  }

  return {
    subject: subjects[conn] ?? subjects.other,
    body:    bodies[conn]   ?? bodies.other,
  }
}
