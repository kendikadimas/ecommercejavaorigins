// Branded HTML email templates for Java Origins.
// Every outgoing email is wrapped in the same layout so customers always see a
// consistent, recognisable brand instead of plain text.
//
// Design constraints (email clients are not browsers):
// - table-based layout, inline styles only (Gmail/Outlook strip <style> blocks)
// - no flexbox/grid, no external CSS/images that could be blocked
// - brand colours mirror the site: #276F27 (green), #140E0A (ink), #FACC15 (gold)

const BRAND = {
  green: '#276F27',
  greenDark: '#1F5A1F',
  ink: '#140E0A',
  gold: '#FACC15',
  bg: '#F3F7ED',
  border: '#CBE0B4',
  muted: '#5A7543',
};

export type EmailTone = 'success' | 'info' | 'warning' | 'danger';

const TONE: Record<EmailTone, { bar: string; label: string }> = {
  success: { bar: '#499A13', label: 'Payment approved' },
  info: { bar: '#276F27', label: 'Order update' },
  warning: { bar: '#D97706', label: 'Action needed' },
  danger: { bar: '#DC2626', label: 'Attention' },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface EmailTemplateOptions {
  /** Card heading, e.g. "Order Confirmed" */
  heading: string;
  /** Short line above the heading, e.g. "Order #JO-1234" */
  eyebrow?: string;
  tone?: EmailTone;
  /** Main paragraphs — plain text, escaped automatically. */
  paragraphs: string[];
  /** Optional primary call-to-action button. */
  action?: { label: string; url: string };
  /** Optional key/value rows rendered as a receipt-style table. */
  details?: { label: string; value: string }[];
  /** Optional list of order line items. */
  items?: { name: string; quantity: number; price: string }[];
  /** Optional total row rendered under the items table. */
  total?: string;
  /** Optional footnote shown in a highlighted box (e.g. "save this link"). */
  note?: { title: string; body: string };
  /** Optional small print under the button. */
  footnote?: string;
}

function detailRows(rows: { label: string; value: string }[]): string {
  return rows
    .map(
      (r, i) => `
              <tr>
                <td style="padding:10px 0;${i ? 'border-top:1px solid #EAF3DB;' : ''}color:${BRAND.muted};font-size:13px;">${escapeHtml(
        r.label
      )}</td>
                <td align="right" style="padding:10px 0;${
                  i ? 'border-top:1px solid #EAF3DB;' : ''
                }color:${BRAND.ink};font-size:13px;font-weight:700;">${escapeHtml(r.value)}</td>
              </tr>`
    )
    .join('');
}

function itemRows(items: { name: string; quantity: number; price: string }[]): string {
  return items
    .map(
      (it) => `
              <tr>
                <td style="padding:10px 0;border-top:1px solid #EAF3DB;color:${BRAND.ink};font-size:13px;">
                  ${escapeHtml(it.name)}
                  <span style="color:${BRAND.muted};"> &times;${it.quantity}</span>
                </td>
                <td align="right" style="padding:10px 0;border-top:1px solid #EAF3DB;color:${BRAND.ink};font-size:13px;font-weight:700;">${escapeHtml(
        it.price
      )}</td>
              </tr>`
    )
    .join('');
}

/**
 * Renders a complete, email-client-safe HTML document for Java Origins.
 */
export function renderEmail(opts: EmailTemplateOptions): string {
  const tone = TONE[opts.tone || 'info'];
  const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://javaorigins.co.nz').replace(
    /\/+$/,
    ''
  );

  const paragraphs = opts.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#2C2018;">${escapeHtml(p)}</p>`
    )
    .join('');

  const action = opts.action
    ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;">
                <tr>
                  <td align="center" style="border-radius:12px;background:${BRAND.green};">
                    <a href="${escapeHtml(opts.action.url)}"
                       style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(
      opts.action.label
    )}</a>
                  </td>
                </tr>
              </table>`
    : '';

  const details = opts.details?.length
    ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;">
                <tr>
                  <td style="padding:6px 18px 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${detailRows(opts.details)}
                    </table>
                  </td>
                </tr>
              </table>`
    : '';

  const items = opts.items?.length
    ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;">
${itemRows(opts.items)}
                ${
                  opts.total
                    ? `<tr>
                  <td style="padding:12px 0 0;border-top:2px solid ${BRAND.border};color:${BRAND.ink};font-size:14px;font-weight:bold;">Total</td>
                  <td align="right" style="padding:12px 0 0;border-top:2px solid ${BRAND.border};color:${BRAND.green};font-size:16px;font-weight:bold;">${escapeHtml(
                      opts.total
                    )}</td>
                </tr>`
                    : ''
                }
              </table>`
    : '';

  const note = opts.note
    ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:${BRAND.bg};border-left:4px solid ${BRAND.green};border-radius:8px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:${BRAND.greenDark};">${escapeHtml(
        opts.note.title
      )}</p>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(
        opts.note.body
      )}</p>
                  </td>
                </tr>
              </table>`
    : '';

  const footnote = opts.footnote
    ? `<p style="margin:18px 0 0;font-size:11px;line-height:1.6;color:#8A8A8A;">${escapeHtml(
        opts.footnote
      )}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#EFEFEA;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEFEA;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E2DA;">

          <!-- Brand header -->
          <tr>
            <td style="background:${BRAND.ink};padding:26px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;letter-spacing:0.14em;color:${BRAND.gold};text-transform:uppercase;">Java Origins</p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;color:#C9BE9A;text-transform:uppercase;">Authentic Indonesian Herbal Beverage</p>
            </td>
          </tr>

          <!-- Tone bar -->
          <tr>
            <td style="background:${tone.bar};padding:9px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase;">${escapeHtml(
    tone.label
  )}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;">
              ${
                opts.eyebrow
                  ? `<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.08em;color:${BRAND.green};text-transform:uppercase;">${escapeHtml(
                      opts.eyebrow
                    )}</p>`
                  : ''
              }
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.3;color:${BRAND.ink};">${escapeHtml(
    opts.heading
  )}</h1>
              ${paragraphs}
              ${details}
              ${items}
              ${action}
              ${note}
              ${footnote}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.bg};padding:20px 28px;border-top:1px solid ${BRAND.border};">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${BRAND.muted};">
                Need help? Reply to this email or message us on WhatsApp.
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#8A8A8A;">
                &copy; ${new Date().getFullYear()} Pure Zealand &middot; Java Origins<br />
                Made in Indonesia &middot; BPOM RI Certified &middot; Halal MUI<br />
                <a href="${siteUrl}" style="color:${BRAND.green};text-decoration:none;font-weight:bold;">${escapeHtml(
    siteUrl.replace(/^https?:\/\//, '')
  )}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
