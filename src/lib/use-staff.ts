"use client";

import { useEffect, useState } from "react";

/** True for admin or moderator — can edit data fixes. */
export function useStaffRole(): boolean {
  const [isStaff, setIsStaff] = useState(false);
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        const role = data.user?.role;
        setIsStaff(role === "admin" || role === "moderator");
      })
      .catch(() => {});
  }, []);
  return isStaff;
}
