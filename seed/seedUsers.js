import { supabaseAdmin } from "../config/supabaseAdmin.js";

export async function createSeedUser({ email, full_name, role }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,

    password: "Password123!",

    email_confirm: true,
  });

  if (error) throw error;

  const userId = data.user.id;

  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: userId,

    email,

    full_name,

    role,
  });

  if (userError) throw userError;

  return userId;
}
