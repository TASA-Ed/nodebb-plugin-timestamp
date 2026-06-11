// filter:composer.formatting 的 payload 类型
export interface FormattingPayload {
  options: Array<{
    name: string;
    className: string;
    title: string;
    // 可选：插入文本时的包裹符号
    startTag?: string;
    endTag?: string;
  }>;
}

// filter:parse.post 的 data 类型
export interface ParsePostData {
  postData: {
    pid?: number;
    content: string;
    uid?: number;
  };
  uid?: number;
}

// filter:parse.raw 传入的是原始字符串本身（用于解析任意文本片段，如编辑器预览），
// 而非 parse.post 那样的对象
export type ParseRawData = string;
