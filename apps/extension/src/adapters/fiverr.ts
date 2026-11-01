// Fiverr ke liye qawaid. Baad mein WhatsApp wagera ke alag adapters isi shakal mein banenge.
export const fiverrAdapter = {
  name: "fiverr",

  matches(loc: Location): boolean {
    return loc.hostname === "www.fiverr.com" || loc.hostname === "fiverr.com";
  },

  // Translate button sirf tab dikhao jab user parhne wali jagah se text select kare,
  // likhne wale box (reply box, search box) se nahi
  shouldOffer(selection: Selection, text: string): boolean {
    if (text.length < 2) return false;

    const active = document.activeElement as HTMLElement | null;
    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)
    ) {
      return false;
    }

    const node = selection.anchorNode;
    const el = node instanceof Element ? node : (node?.parentElement ?? null);
    if (!el) return false;
    if (el.closest("input, textarea, [contenteditable=''], [contenteditable='true']")) return false;

    return true;
  },
};