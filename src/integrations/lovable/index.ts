// Lovable platform integration — stubbed out for non-Lovable environments.
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: "google" | "apple", _opts?: SignInOptions) => {
      // OAuth via Supabase directly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: _provider,
        options: {
          redirectTo: _opts?.redirect_uri,
          queryParams: _opts?.extraParams,
        },
      });
      if (error) return { error };
      return { data };
    },
  },
};
