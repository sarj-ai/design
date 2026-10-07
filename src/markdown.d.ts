/** `next.config.ts` imports `.md` files as their raw text. */
declare module "*.md" {
  const content: string
  export default content
}
