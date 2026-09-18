import type { Access, FieldAccess, PayloadRequest } from "payload";

// Accounts created before roles were introduced were all Payload administrators.
export function roleOf(user: PayloadRequest["user"]) {
  return user ? user.role || "admin" : undefined;
}
export const isStaff: Access = ({ req }) => Boolean(req.user);
export const isAdmin: Access = ({ req }) => roleOf(req.user) === "admin";
export const isApprover: Access = ({ req }) =>
  ["admin", "approver"].includes(roleOf(req.user) || "");
export const adminField: FieldAccess = ({ req }) =>
  roleOf(req.user) === "admin";
export const staffField: FieldAccess = ({ req }) => Boolean(req.user);
export const noAccess: Access = () => false;
export const staffAccess = {
  create: isStaff,
  read: isStaff,
  update: isStaff,
  delete: isAdmin,
};
