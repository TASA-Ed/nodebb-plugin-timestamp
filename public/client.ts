/// <reference types="jquery"/>

// bootbox 模块类型（通过 require(["bootbox"], ...) 按需加载）
interface Bootbox {
  dialog: (options: {
    title: string;
    message: string;
    buttons: Record<
      string,
      {
        label: string;
        className: string;
        callback?: () => void | boolean;
      }
    >;
  }) => void;
}

// NodeBB 的 AMD require（RequireJS 风格）
declare function require(deps: string[], callback: (...modules: unknown[]) => void): void;

// composer/formatting 模块只用到 addButtonDispatch
interface FormattingModule {
  // handler 由 dispatch table 调用，this 指向 postContainer
  addButtonDispatch: (
    name: string,
    onClick: (
      this: JQuery,
      textarea: HTMLTextAreaElement,
      selectionStart: number,
      selectionEnd: number,
      event: JQuery.Event
    ) => void
  ) => void;
}

/**
 * 获取 datetime-local input 所需的格式 "YYYY-MM-DDTHH:MM"
 */
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * 在 textarea 光标位置插入文本
 */
function insertAtCursor(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
  text: string
): void {
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
  // 触发 NodeBB 编辑器的响应式更新与预览刷新
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * 打开时间选择弹窗，确认后把标记插入到 textarea 光标处
 */
function openTimePicker(
  textarea: HTMLTextAreaElement,
  selectionStart: number,
  selectionEnd: number
): void {
  const defaultValue = toDatetimeLocalValue(new Date());

  require(["bootbox"], (bootbox: unknown) => {
    (bootbox as Bootbox).dialog({
      title: "[[timestamp:dialog.title]]",
      message: `
        <div class="form-group">
          <label for="plugin-ts-picker" class="form-label">[[timestamp:dialog.label]]</label>
          <input
            type="datetime-local"
            id="plugin-ts-picker"
            class="form-control"
            value="${defaultValue}"
          />
          <div class="form-text text-muted" style="margin-top:6px">
            [[timestamp:dialog.description]]
          </div>
        </div>
      `,
      buttons: {
        cancel: {
          label: "[[timestamp:dialog.cancel]]",
          className: "btn-secondary"
        },
        confirm: {
          label: "[[timestamp:dialog.confirm]]",
          className: "btn-primary",
          callback(): void {
            const input = document.getElementById("plugin-ts-picker") as HTMLInputElement | null;
            if (!input?.value) return;

            const ts = new Date(input.value).getTime();
            if (isNaN(ts)) return;

            insertAtCursor(textarea, selectionStart, selectionEnd, `[timestamp]${ts}[/timestamp]`);
          }
        }
      }
    });
  });
}

// NodeBB 页面加载完成后，向 composer 的 dispatch table 注册按钮点击处理
$(window).on("action:app.load", () => {
  require(["composer/formatting"], (formatting: unknown) => {
    (formatting as FormattingModule).addButtonDispatch(
      "timestamp",
      function (textarea, selectionStart, selectionEnd): void {
        openTimePicker(textarea, selectionStart, selectionEnd);
      }
    );
  });
});
