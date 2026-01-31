import { createSafeActionClient } from 'next-safe-action';
import type { User } from './auth-types';
import { isDemoWebsite } from './demo';
import { getSession } from './server';

// Context type for authenticated actions
type UserContext = { user: User };

// -----------------------------------------------------------------------------
// 1. Base action client – put global error handling / metadata here if needed
// -----------------------------------------------------------------------------
export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    if (e instanceof Error) {
      return {
        success: false,
        error: e.message,
      };
    }

    return {
      success: false,
      error: 'Something went wrong while executing the action',
    };
  },
});

// -----------------------------------------------------------------------------
// 2. Auth-guarded client
// -----------------------------------------------------------------------------
export const userActionClient = actionClient.use<UserContext>(async ({ next }) => {
  const session = await getSession();
  if (!session?.user) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }

  return next({ ctx: { user: session.user as User } });
});

// -----------------------------------------------------------------------------
// 3. Admin-only client (extends auth client)
// -----------------------------------------------------------------------------
export const adminActionClient = userActionClient.use(async ({ next, ctx }) => {
  const user = ctx.user;
  const isDemo = isDemoWebsite();
  const isAdmin = user.role === 'admin';

  // If this is a demo website and user is not an admin, allow the request
  if (!isAdmin && !isDemo) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }

  return next({ ctx: { user } });
});
