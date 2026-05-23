import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type UnifiedUser = {
  id: number;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: string;
  authType: "oauth" | "local";
  username?: string;
  displayName?: string | null;
};

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!localStorage.getItem("local_auth_token"),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user: UnifiedUser | null = useMemo(() => {
    if (oauthUser) {
      return {
        id: oauthUser.id,
        name: oauthUser.name || "User",
        email: oauthUser.email,
        avatar: oauthUser.avatar,
        role: oauthUser.role,
        authType: "oauth" as const,
      };
    }
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name || localUser.username || "User",
        role: localUser.role,
        authType: "local" as const,
        username: localUser.username,
        displayName: localUser.displayName,
      };
    }
    return null;
  }, [oauthUser, localUser]);

  const isAdmin = user?.role === "admin";
  const isLoading = oauthLoading || localLoading;
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    logoutMutation.mutate();
    window.location.href = "/";
  }, [logoutMutation]);

  return {
    user,
    isAdmin,
    isLoading,
    isAuthenticated,
    logout,
  };
}
