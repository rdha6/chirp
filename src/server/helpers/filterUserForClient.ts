import type { User } from "@clerk/clerk-sdk-node";
// Utility to trim down Clerk user object
export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.imageUrl,
  };
};