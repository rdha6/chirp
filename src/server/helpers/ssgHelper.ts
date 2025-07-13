import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import superjson from "superjson";

export const generateServerSideHelper = async () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createInnerTRPCContext(),
    transformer: superjson,
  });
};