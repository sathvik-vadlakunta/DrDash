import type { Role } from "@prisma/client";
import { hashPassword } from "../../src/lib/password";

/**
 * Demo accounts. All use the password below — change it before any
 * non-classroom deployment.
 */
export const DEMO_PASSWORD = "drdash-demo";

export const SEED_USERS: {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}[] = [
  {
    email: "instructor@drdash.test",
    name: "Prof. Dash",
    role: "INSTRUCTOR",
    passwordHash: hashPassword(DEMO_PASSWORD),
  },
  {
    email: "student1@drdash.test",
    name: "Sam Student",
    role: "STUDENT",
    passwordHash: hashPassword(DEMO_PASSWORD),
  },
  {
    email: "student2@drdash.test",
    name: "Riley Learner",
    role: "STUDENT",
    passwordHash: hashPassword(DEMO_PASSWORD),
  },
  {
    email: "admin@drdash.test",
    name: "Dash Admin",
    role: "ADMIN",
    passwordHash: hashPassword(DEMO_PASSWORD),
  },
];
