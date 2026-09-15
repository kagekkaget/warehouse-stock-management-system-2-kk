/**
 * Pure role/permission definitions — safe to import from client components.
 * (No database or Node-only dependencies here.)
 */

export type Role = "owner" | "manager" | "staff";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Pemilik",
  manager: "Manajer",
  staff: "Staf",
};

export const can = {
  manageProducts: (r: Role) => r === "owner" || r === "manager",
  adjustStock: (_r: Role) => true,
  recordWaste: (_r: Role) => true,
  createCustomer: (_r: Role) => true,
  editCustomer: (r: Role) => r === "owner" || r === "manager",
  deleteCustomer: (r: Role) => r === "owner" || r === "manager",
  createOrder: (_r: Role) => true,
  updateOrder: (_r: Role) => true,
  deleteOrder: (r: Role) => r === "owner" || r === "manager",
  viewReports: (_r: Role) => true,
  exportReports: (r: Role) => r === "owner" || r === "manager",
  manageUsers: (r: Role) => r === "owner",
};
