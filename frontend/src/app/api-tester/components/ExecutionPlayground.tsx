import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardLayout } from "./CardLayout";
import { Endpoint, QueryParam } from "../types";

type ExecutionPlaygroundProps = {
  reqMethod: Endpoint["method"];
  setReqMethod: (method: Endpoint["method"]) => void;
  reqPath: string;
  setReqPath: (path: string) => void;
  queryParams: QueryParam[];
  setQueryParams: (params: QueryParam[]) => void;
  reqBody: string;
  setReqBody: (body: string) => void;
  executing: boolean;
  executeRequest: () => void;
  children?: React.ReactNode;
};

export function ExecutionPlayground({
  reqMethod,
  setReqMethod,
  reqPath,
  setReqPath,
  queryParams,
  setQueryParams,
  reqBody,
  setReqBody,
  executing,
  executeRequest,
  children
}: ExecutionPlaygroundProps) {
  return (
    <CardLayout 
      title="Execution Playground" 
      desc="Construct and execute live HTTP requests directly into the local port 4001 backend."
    >
      <div className="space-y-4">
        
        {/* Method & Path inputs */}
        <div className="flex gap-2">
          <select
            value={reqMethod}
            onChange={(e) => setReqMethod(e.target.value as Endpoint["method"])}
            className="w-[100px] shrink-0 border border-zinc-205 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2 rounded-xl text-body-small-s font-semibold focus:outline-none focus:ring-2 focus:ring-primary-dark"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-body-caption font-semibold text-zinc-400 font-mono">/api</span>
            <Input 
              value={reqPath}
              onChange={(e) => setReqPath(e.target.value)}
              placeholder="/health"
              className="pl-11 h-11 font-mono text-body-small rounded-xl"
            />
          </div>
        </div>

        {/* Query Parameters Section */}
        <div className="space-y-2 border border-zinc-150 dark:border-zinc-850 p-3 rounded-xl bg-zinc-50/20">
          <div className="flex justify-between items-center pb-1">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Query Parameters</Label>
            <button
              type="button"
              onClick={() => setQueryParams([...queryParams, { key: "", value: "" }])}
              className="text-body-caption font-semibold text-primary-light hover:underline hover:text-primary-dark cursor-pointer"
            >
              + Add Param
            </button>
          </div>
          {queryParams.length === 0 ? (
            <p className="text-body-caption text-zinc-455 italic">No query parameters appended.</p>
          ) : (
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {queryParams.map((param, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="key"
                    value={param.key}
                    onChange={(e) => {
                      const list = [...queryParams];
                      list[index].key = e.target.value;
                      setQueryParams(list);
                    }}
                    className="h-9 font-mono rounded-lg text-xs"
                  />
                  <Input
                    placeholder="value"
                    value={param.value}
                    onChange={(e) => {
                      const list = [...queryParams];
                      list[index].value = e.target.value;
                      setQueryParams(list);
                    }}
                    className="h-9 font-mono rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...queryParams];
                      list.splice(index, 1);
                      setQueryParams(list);
                    }}
                    className="text-zinc-400 hover:text-red-500 text-xs px-1 cursor-pointer font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request JSON Body Section */}
        {reqMethod !== "GET" && (
          <div className="space-y-1.5">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Request Body (JSON)</Label>
            <textarea
              rows={6}
              value={reqBody}
              onChange={(e) => setReqBody(e.target.value)}
              placeholder={`{\n  "key": "value"\n}`}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-dark dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            />
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={executeRequest}
          disabled={executing}
          className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none h-11 py-0 shadow-sm gap-2"
        >
          <Send className="h-4 w-4" /> {executing ? "Executing Request..." : "Send Request"}
        </Button>

        {children}

      </div>
    </CardLayout>
  );
}
