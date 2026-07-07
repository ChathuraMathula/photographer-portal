import { CheckCircle2, XCircle, Check, Copy } from "lucide-react";

type ResponseConsoleProps = {
  latency: number | null;
  responseStatus: number | null;
  responseStatusText: string;
  responseHeaders: Record<string, string>;
  responseData: string;
  copiedText: string | null;
  handleCopy: (text: string, id: string) => void;
};

export function ResponseConsole({
  latency,
  responseStatus,
  responseStatusText,
  responseHeaders,
  responseData,
  copiedText,
  handleCopy,
}: ResponseConsoleProps) {
  return (
    <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-body-small-s font-semibold text-zinc-750 dark:text-zinc-250">
          Response Console
        </h4>
        {latency && (
          <span className="text-body-caption font-bold text-zinc-405 font-mono">
            Time: {latency} ms
          </span>
        )}
      </div>

      {responseStatus !== null ? (
        <div className="space-y-3">
          {/* Status status badge */}
          <div
            className={`flex justify-between items-center p-3 rounded-xl border ${
              responseStatus >= 200 && responseStatus < 300
                ? "bg-emerald-50/50 border-emerald-200/50 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-400"
                : "bg-red-50/50 border-red-200/50 text-red-800 dark:bg-red-950/10 dark:text-red-400"
            }`}
          >
            <div className="flex items-center gap-1.5 text-body-small-s font-bold">
              {responseStatus >= 200 && responseStatus < 300 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>
                Status: {responseStatus} {responseStatusText}
              </span>
            </div>
            <button
              onClick={() => handleCopy(responseData, "resp")}
              className="text-body-caption font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedText === "resp" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedText === "resp" ? "Copied" : "Copy Body"}
            </button>
          </div>

          {/* Header Summary */}
          {Object.keys(responseHeaders).length > 0 && (
            <div className="text-body-caption font-mono text-zinc-400 max-h-[80px] overflow-y-auto border border-zinc-150 dark:border-zinc-850 p-2 rounded-lg bg-zinc-50/50">
              {Object.entries(responseHeaders)
                .slice(0, 3)
                .map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="font-bold">{k}:</span> {v}
                  </div>
                ))}
            </div>
          )}

          {/* Body Scroll area */}
          <pre className="max-h-[350px] overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-body-caption text-zinc-100 select-all leading-relaxed font-medium whitespace-pre-wrap break-words">
            {responseData || "{}"}
          </pre>
        </div>
      ) : (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-8 rounded-xl text-center text-body-small text-zinc-400 bg-white dark:bg-zinc-900/30">
          No response yet. Fill out fields above and click &quot;Send
          Request&quot;.
        </div>
      )}
    </div>
  );
}
