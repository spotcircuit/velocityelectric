/**
 * Cloudflare Email Worker — captures inbound emails to *@velocityelectric.co
 * into the Velocity Electric site's lead pipeline, then forwards the original to
 * Josh's primary inbox.
 *
 * NO npm imports — pasteable directly into Cloudflare Dashboard's Worker editor.
 * MIME parsing happens server-side at /api/inbound-email (uses letterparser).
 *
 * SETUP:
 * 1. Cloudflare Dashboard → Workers & Pages → Create Worker
 *    - Click "Hello World!" template, name it `velocity-email-capture`
 * 2. Replace the default code with the contents of THIS file.
 * 3. Settings → Variables → Add:
 *      INBOUND_SECRET = <value from rebar/system/.env line INBOUND_SECRET_VELOCITY>
 *    Same value is already in Vercel envs as INBOUND_SECRET.
 * 4. Save and Deploy.
 * 5. Cloudflare → velocityelectric.co → Email → Routing → Routing Rules:
 *      - Edit `josh@velocityelectric.co`: Action = Send to Worker → velocity-email-capture
 *      - Edit catch-all: Action = Send to Worker → velocity-email-capture
 *    The Worker forwards to capitalholding.com so Josh still receives the email.
 */

const VERCEL_ENDPOINT = 'https://www.velocityelectric.co/api/inbound-email'
const FORWARD_TO = 'josh@velocitycapitalholding.com'

export default {
  async email(message, env) {
    // Read the raw RFC822 message from the stream.
    let raw = ''
    try {
      const reader = message.raw.getReader()
      const decoder = new TextDecoder('utf-8', { fatal: false })
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
      }
      raw += decoder.decode()
    } catch (err) {
      console.error('raw read failed:', err)
    }

    // Best-effort POST to Vercel — never block the forward on failure.
    try {
      const res = await fetch(VERCEL_ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-inbound-secret': env.INBOUND_SECRET,
        },
        body: JSON.stringify({
          raw,
          fromHint: message.from,
          toHint: message.to,
          subject: message.headers.get('subject') || '',
          messageId: message.headers.get('message-id') || '',
        }),
      })
      if (!res.ok) {
        console.error('inbound-email POST failed:', res.status, await res.text())
      }
    } catch (err) {
      console.error('inbound-email POST threw:', err)
    }

    // ALWAYS forward — capture is purely additive, delivery is mandatory.
    try {
      await message.forward(FORWARD_TO)
    } catch (err) {
      console.error('forward failed:', err)
    }
  },
}
