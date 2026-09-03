import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

/**
 * The password gate on the published site.
 *
 * Everything is behind it — every route, every static asset, and `public/r/*`,
 * the shadcn registry — because a mockup carries the ticket it answers and real
 * customer names in its mock data, and the registry JSON carries the whole
 * source of one.
 *
 * HTTP Basic rather than a login page: the browser asks, and until it is
 * answered the site renders nothing at all. There is no form to design, no
 * cookie to expire, and no half-loaded page behind a modal.
 *
 * The password lives in `SITE_PASSWORD`, never in this repo — the remote is
 * pushed, so a literal here would be the password published alongside the thing
 * it protects. Set it in `.env.local` to see the prompt on localhost; set it in
 * the Vercel project to put it in front of the deployed site.
 *
 * With no `SITE_PASSWORD` at all: open locally, so `npm run dev` and the
 * capture scripts need no credentials — and shut on Vercel, so a deploy is
 * never accidentally public.
 */

// const CHALLENGE = 'Basic realm="Design lab", charset="UTF-8"'

export function proxy() {
  return NextResponse.next()
}

/* ---------------------------------------------------------------------------
 * TURNED OFF. To switch the gate back on: delete the pass-through above and
 * uncomment the function below. `.env.local` still holds SITE_PASSWORD, so
 * localhost prompts again the moment it is uncommented; the deployed site also
 * needs SITE_PASSWORD in the Vercel project.
 * ------------------------------------------------------------------------ */

// export function proxy(request: NextRequest) {
//   const password = process.env.SITE_PASSWORD
//
//   /* On Vercel the gate is not optional: a deploy that forgot the variable is
//      unreachable rather than public, so one missing env var can never silently
//      undo it. `VERCEL` is set by the platform and cannot be spoofed by a
//      request header. */
//   if (!password) {
//     return process.env.VERCEL ? locked() : NextResponse.next()
//   }
//
//   const header = request.headers.get("authorization")
//   if (!header?.startsWith("Basic ")) return locked()
//
//   let decoded: string
//   try {
//     decoded = atob(header.slice("Basic ".length))
//   } catch {
//     return locked()
//   }
//
//   /* Only the password is checked. Any username gets in, so nobody has to be
//      told one — the prompt has two fields and only the second matters. */
//   const supplied = decoded.slice(decoded.indexOf(":") + 1)
//
//   return matches(supplied, password) ? NextResponse.next() : locked()
// }

// /** Length-independent compare, so a wrong password takes the same time. */
// function matches(supplied: string, password: string) {
//   if (supplied.length !== password.length) return false
//
//   let difference = 0
//   for (let index = 0; index < password.length; index += 1) {
//     difference |= supplied.charCodeAt(index) ^ password.charCodeAt(index)
//   }
//   return difference === 0
// }
//
// /** Empty body: the prompt is the browser's, and the page shows nothing. */
// function locked() {
//   return new NextResponse(null, {
//     status: 401,
//     headers: {
//       "WWW-Authenticate": CHALLENGE,
//       /* Never let a CDN or a shared proxy hold on to either the challenge or
//          anything served after it. */
//       "Cache-Control": "no-store",
//     },
//   })
// }
