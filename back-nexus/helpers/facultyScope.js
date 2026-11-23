export const resolveFacultyScopeId = (req, requestedFacultyId) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  const authenticatedUserId = req.user?.userId ?? req.user?.user_id;

  if (role === "faculty") return authenticatedUserId || null;
  if (role === "admin") return requestedFacultyId || authenticatedUserId || null;
  return null;
};
