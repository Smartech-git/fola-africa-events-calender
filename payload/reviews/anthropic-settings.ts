export const DEFAULT_REVIEW_MODEL = "claude-sonnet-5-5";

export function reviewModel() {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_REVIEW_MODEL;
}
