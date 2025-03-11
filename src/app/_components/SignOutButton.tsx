import { logout } from "@/lib/action";
import React from "react";

const SignOutButton = () => {
  return (
    <form
      action={async (formData) => {
        "use server";
        await logout();
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  );
};

export default SignOutButton;
