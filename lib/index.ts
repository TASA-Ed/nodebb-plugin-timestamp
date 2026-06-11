import type { FormattingPayload, ParsePostData, ParseRawData } from "./type.ts";

// 匹配标记：[timestamp]1700000000000[/timestamp]
const TIMESTAMP_REGEX = /\[timestamp](\d{10,13})\[\/timestamp]/g;

/**
 * 向编辑器工具栏注册按钮
 * 对应 plugin.json 中 filter:composer.formatting
 */
export function registerFormatting(
  payload: FormattingPayload,
  callback: (err: Error | null, payload: FormattingPayload) => void
): void {
  payload.options.push({
    name: "timestamp",
    className: "fa fa-clock-o",
    title: "[[timestamp:composer.timestamp]]"
  });
  callback(null, payload);
}

function applyTimestamp(content: string) {
  return content.replace(TIMESTAMP_REGEX, (_match: string, ts: string) => {
    const epoch = parseInt(ts, 10);
    if (isNaN(epoch)) return _match;

    const date = new Date(epoch);
    const iso = date.toISOString();
    // datetime 提供机器可读的 ISO 时间
    // 实际显示文本由客户端 JS 根据用户本地时区渲染
    // 服务端仅输出 UTC 作为 fallback
    return [
      `<time`,
      `  class="timeago plugin-timestamp"`,
      `  datetime="${iso}"`,
      `  title="${iso}"`,
      `  data-timestamp="${epoch}"`,
      `>${iso}</time>`
    ].join(" ");
  });
}

/**
 * 解析帖子内容，将时间戳标记转换为 HTML
 * 对应 plugin.json 中 filter:parse.post
 */
export function parsePost(
  data: ParsePostData,
  callback: (err: Error | null, data: ParsePostData) => void
): void {
  if (!data?.postData?.content) {
    callback(null, data);
    return;
  }

  data.postData.content = applyTimestamp(data.postData.content);

  callback(null, data);
}

/**
 * 解析 Raw，将时间戳标记转换为 HTML
 * 对应 plugin.json 中 filter:parse.raw
 *
 * 注意：filter:parse.raw 传入的是原始字符串本身（用于编辑器预览等场景），
 * 与 filter:parse.post 的对象结构不同
 */
export function parseRaw(
  raw: ParseRawData,
  callback: (err: Error | null, raw: ParseRawData) => void
): void {
  if (!raw) {
    callback(null, raw);
    return;
  }

  callback(null, applyTimestamp(raw));
}
