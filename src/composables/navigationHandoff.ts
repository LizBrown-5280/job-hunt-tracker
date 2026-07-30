import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export type HandoffField = 'companyId' | 'positionId' | 'recruiterId';
type HandoffStackFrame = {
  returnTo: string;
  returnDraftKey: string;
  returnField: HandoffField;
};

const HANDOFF_STACK_KEY = 'job-hunt-tracker-handoff-stack-v1';

export function getQueryString(route: RouteLocationNormalizedLoaded, key: string): string {
  const value = route.query[key];
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return '';
}

export function persistHandoffDraft<T>(draftKey: string, draft: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(draftKey, JSON.stringify(draft));
}

export function restoreHandoffDraft<T extends object>(
  route: RouteLocationNormalizedLoaded,
  draftKey: string,
  fallbackDraft: T,
  mergeDraft?: (parsedDraft: Partial<T>, fallback: T) => T,
): T {
  if (typeof window === 'undefined') {
    return fallbackDraft;
  }

  const restoreDraftKey = getQueryString(route, 'restoreDraftKey');
  if (restoreDraftKey !== draftKey) {
    return fallbackDraft;
  }

  const raw = window.sessionStorage.getItem(draftKey);
  window.sessionStorage.removeItem(draftKey);
  if (!raw) {
    return fallbackDraft;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<T>;
    if (mergeDraft) {
      return mergeDraft(parsed, fallbackDraft);
    }

    return {
      ...fallbackDraft,
      ...parsed,
    };
  } catch {
    return fallbackDraft;
  }
}

export function navigateToCreateWithHandoff(
  router: Router,
  returnTo: string,
  targetPath: string,
  draftKey: string,
  returnField: HandoffField,
): void {
  pushHandoffFrame({
    returnTo,
    returnDraftKey: draftKey,
    returnField,
  });

  void router.push({
    path: targetPath,
    query: {
      handoff: '1',
    },
  });
}

export function getHandoffResult(route: RouteLocationNormalizedLoaded): {
  field: HandoffField;
  id: number;
} | null {
  const handoffField = getQueryString(route, 'handoffField');
  const handoffIdRaw = getQueryString(route, 'handoffId');
  const handoffId = handoffIdRaw ? Number(handoffIdRaw) : Number.NaN;

  if (!Number.isFinite(handoffId)) {
    return null;
  }

  if (
    handoffField !== 'companyId' &&
    handoffField !== 'positionId' &&
    handoffField !== 'recruiterId'
  ) {
    return null;
  }

  return {
    field: handoffField,
    id: handoffId,
  };
}

export function returnFromHandoffWithId(
  route: RouteLocationNormalizedLoaded,
  router: Router,
  handoffId: number | null,
): boolean {
  if (handoffId == null) {
    return false;
  }

  const frame = popHandoffFrame();
  if (frame) {
    void router.push({
      path: frame.returnTo,
      query: {
        handoffId: String(handoffId),
        restoreDraftKey: frame.returnDraftKey,
        handoffField: frame.returnField,
        handoff: '1',
      },
    });
    return true;
  }

  const returnTo = getQueryString(route, 'returnTo');
  if (!returnTo) {
    return false;
  }

  const returnDraftKey = getQueryString(route, 'returnDraftKey');
  const returnField = getQueryString(route, 'returnField');
  const query: Record<string, string> = {
    handoffId: String(handoffId),
  };

  if (returnDraftKey) {
    query.restoreDraftKey = returnDraftKey;
  }

  if (returnField) {
    query.handoffField = returnField;
  }

  void router.push({ path: returnTo, query });
  return true;
}

export function clearHandoffQuery(route: RouteLocationNormalizedLoaded, router: Router): void {
  const nextQuery = { ...route.query };
  delete nextQuery.handoff;
  delete nextQuery.restoreDraftKey;
  delete nextQuery.handoffField;
  delete nextQuery.handoffId;
  delete nextQuery.returnTo;
  delete nextQuery.returnDraftKey;
  delete nextQuery.returnField;
  void router.replace({ path: route.path, query: nextQuery });
}

function loadHandoffStack(): HandoffStackFrame[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.sessionStorage.getItem(HANDOFF_STACK_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isHandoffStackFrame);
  } catch {
    return [];
  }
}

function persistHandoffStack(stack: HandoffStackFrame[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (stack.length === 0) {
    window.sessionStorage.removeItem(HANDOFF_STACK_KEY);
    return;
  }

  window.sessionStorage.setItem(HANDOFF_STACK_KEY, JSON.stringify(stack));
}

function pushHandoffFrame(frame: HandoffStackFrame): void {
  const stack = loadHandoffStack();
  stack.push(frame);
  persistHandoffStack(stack);
}

function popHandoffFrame(): HandoffStackFrame | null {
  const stack = loadHandoffStack();
  const frame = stack.pop() ?? null;
  persistHandoffStack(stack);
  return frame;
}

function isHandoffStackFrame(value: unknown): value is HandoffStackFrame {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HandoffStackFrame>;
  return (
    typeof candidate.returnTo === 'string' &&
    typeof candidate.returnDraftKey === 'string' &&
    (candidate.returnField === 'companyId' ||
      candidate.returnField === 'positionId' ||
      candidate.returnField === 'recruiterId')
  );
}
