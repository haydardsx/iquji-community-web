// 上游的 exports 缺少 types 条件，此处对应其公开的解析器声明。
declare module "@fig/lezer-bash" {
  export const parser: import("@lezer/lr").LRParser;
}
