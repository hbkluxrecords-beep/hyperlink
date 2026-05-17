// Global pub/sub for inline previews.
// Whenever a card starts playing, every other card subscribed gets notified
// and pauses itself. Keeps only one preview audible site-wide.

let currentId = null;
const subs = new Set();

export function claimAudio(id) {
  currentId = id;
  subs.forEach((fn) => fn(currentId));
}

export function releaseAudio(id) {
  if (currentId === id) {
    currentId = null;
    subs.forEach((fn) => fn(null));
  }
}

export function getCurrentId() {
  return currentId;
}

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
