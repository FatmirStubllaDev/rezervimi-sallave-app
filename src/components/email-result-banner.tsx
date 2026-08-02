import type { SentEmail } from "@/lib/types";

export function EmailResultBanner({ emails }: { emails: SentEmail[] }) {
  if (!emails?.length) return null;

  const previews = emails.filter((e) => e.previewUrl);
  const failed = emails.filter((e) => e.mode === "failed");
  const sent = emails.filter((e) => e.mode !== "failed");

  return (
    <div className="space-y-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">
      <p className="font-medium">
        {sent.length
          ? `Email sent (${sent.length})`
          : "Email could not be sent"}
      </p>
      <ul className="space-y-1 text-xs">
        {emails.map((email, i) => (
          <li key={`${email.to}-${i}`}>
            → {email.to}
            {email.previewUrl ? (
              <>
                {" "}
                —{" "}
                <a
                  href={email.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline"
                >
                  Open email preview
                </a>
              </>
            ) : null}
            {email.error ? ` — ${email.error}` : null}
          </li>
        ))}
      </ul>
      {previews.length > 0 && (
        <p className="text-[11px] text-teal-800/80">
          Dev mode uses Ethereal SMTP. Click “Open email preview” to see the
          message. For real Outlook delivery, set SMTP_* in backend/.env.
        </p>
      )}
      {failed.length > 0 && !previews.length && (
        <p className="text-[11px] text-red-700">
          Check backend logs and SMTP settings.
        </p>
      )}
    </div>
  );
}
