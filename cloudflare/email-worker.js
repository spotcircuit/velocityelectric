/**
 * Cloudflare Email Worker — captures inbound emails to velocityelectric.co
 * addresses, parses MIME, POSTs the structured data to /api/inbound-email on the
 * Velocity site, then forwards the original email to Josh's primary inbox so he
 * still receives it personally.
 *
 * SETUP:
 * 1. Cloudflare Dashboard → Email → Email Workers → Create Worker
 * 2. Paste this file as the worker source.
 * 3. Add `postal-mime` as an npm dependency in the worker (Settings → Variables → ?)
 *    Actually Workers uses package.json — easier route: deploy via wrangler with this
 *    file + a package.json that has postal-mime. Or use the inlined parser path below.
 * 4. Add Environment Variable INBOUND_SECRET (must match Vercel's INBOUND_SECRET).
 * 5. Cloudflare → Email → Routing Rules:
 *    - Edit `josh@velocityelectric.co` rule: change action from "Send to email"
 *      to "Send to Worker" → select this worker.
 *    - Edit catch-all: same change.
 *    - The worker itself re-forwards to capitalholding so nothing is lost.
 *
 * INBOUND_SECRET (set in Cloudflare Worker env):
 *   Match the value already saved at:
 *     - rebar:    /mnt/c/Users/Big Daddy Pyatt/rebar/system/.env  (INBOUND_SECRET_VELOCITY)
 *     - Vercel:   project velocityelectric, all 3 environments, key INBOUND_SECRET
 */

import PostalMime from 'postal-mime'

const VERCEL_ENDPOINT = 'https://www.velocityelectric.co/api/inbound-email'
const FORWARD_TO = 'josh@velocitycapitalholding.com'

export default {
  /**
   * @param {ForwardableEmailMessage} message
   * @param {{ INBOUND_SECRET: string }} env
   */
  async email(message, env) {
    let parsed
    try {
      parsed = await PostalMime.parse(message.raw)
    } catch (err) {
      console.error('postal-mime parse failed:', err)
      // Still forward to Josh even if parse fails — don't drop email
      await message.forward(FORWARD_TO)
      return
    }

    const fromObj = (parsed.from && typeof parsed.from === 'object') ? parsed.from : null
    const fromAddress = fromObj?.address || message.from || ''
    const fromName = fromObj?.name || ''
    const subject = parsed.subject || message.headers.get('subject') || ''
    const text = parsed.text || ''
    const html = parsed.html || ''
    const messageId = parsed.messageId || message.headers.get('message-id') || ''

    // Best effort POST — never block the forward on this.
    try {
      const res = await fetch(VERCEL_ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-inbound-secret': env.INBOUND_SECRET,
        },
        body: JSON.stringify({
          from: message.from,
          fromName,
          fromAddress,
          to: message.to,
          subject,
          text,
          html,
          messageId,
        }),
      })
      if (!res.ok) {
        console.error('inbound-email POST failed:', res.status, await res.text())
      }
    } catch (err) {
      console.error('inbound-email POST threw:', err)
    }

    // Always forward the email itself to Josh — capture pipeline is purely additive.
    try {
      await message.forward(FORWARD_TO)
    } catch (err) {
      console.error('forward failed:', err)
    }
  },
}
