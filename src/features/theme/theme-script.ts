export const THEME_STORAGE_KEY = "monis-theme";

/**
 * Inlined in <head> and run before React hydrates.
 *
 * 1. Sets the theme before first paint so the page never flashes the wrong
 *    one: the saved choice first, otherwise the system setting.
 * 2. Removes stray nodes a host or proxy may inject into <head> (Netlify,
 *    for one, adds a line break and a "hosted on Netlify" comment). React
 *    expects <head> to match what it rendered, so extra nodes trigger
 *    hydration error #418 and a full client re-render. Only blank text nodes
 *    and that comment are removed; React never renders either inside <head>.
 *    Harmless on Vercel, which injects nothing.
 */
export const THEME_INIT_SCRIPT = `(()=>{try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}try{var h=document.head,n=h.firstChild;while(n){var x=n.nextSibling;if((n.nodeType===3&&!n.nodeValue.trim())||(n.nodeType===8&&/Netlify/i.test(n.nodeValue)))h.removeChild(n);n=x}}catch(e){}})()`;
