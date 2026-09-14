/**
 * The address is stored split and base64'd so the literal string never
 * appears in the served HTML or JS bundle. Harvesters that only pattern
 * match over the response body find nothing; anything that executes the
 * page sees the real address, same as a human does.
 *
 * This raises the cost of automated collection. It is not encryption —
 * a scraper that runs JavaScript will still resolve it.
 */
const USER = "c2F0eWFtZGV2ZWxvcGVy"; // satyamdeveloper
const NUM = "OTg="; // 98
const HOST = "Z21haWwuY29t"; // gmail.com

const decode = (s) => (typeof atob === "function" ? atob(s) : "");

export function getEmail() {
  return `${decode(USER)}${decode(NUM)}@${decode(HOST)}`;
}

export function getMailto() {
  return `mailto:${getEmail()}`;
}
