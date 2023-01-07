import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Input } from "src/components/common/input/Input";
import { FeedTile } from "src/components/tile/feedTile/FeedTile";
import { onPromise } from "src/utils/functions";
import { trpc } from "src/utils/trpc";
import { createFeedSchema } from "src/utils/validation";

import type { TRPCError } from "@trpc/server";
import type { CreateFeedInput } from "src/utils/validation";

export const FeedsView = () => {
  const utils = trpc.useContext();
  const { register, handleSubmit } = useForm<CreateFeedInput>({
    resolver: zodResolver(createFeedSchema),
  });

  const feeds = trpc.user.getUserFeeds.useQuery();

  const addFeedMutation = trpc.feed.createFeed.useMutation({
    onSuccess: () => utils.user.getUserFeeds.invalidate(),
  });

  const deleteFeedMutation = trpc.feed.deleteFeed.useMutation({
    onSuccess: () => utils.user.getUserFeeds.invalidate(),
  });

  const onSubmit = async ({ url }: CreateFeedInput) => {
    await toast.promise(
      addFeedMutation.mutateAsync({
        url,
      }),
      {
        loading: "Adding feed...",
        success: ({ message }) => message,
        error: (err: TRPCError | Error) => err.message,
      },
    );
  };

  const handleDeleteFeed = async ({ url }: { url: string }) => {
    await toast.promise(
      deleteFeedMutation.mutateAsync({
        url,
      }),
      {
        loading: "Deleting feed...",
        success: ({ message }) => message,
        error: (err: TRPCError | Error) => err.message,
      },
    );
  };

  return (
    <>
      {feeds.data?.map((feed) => (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <FeedTile url={feed.url} key={feed.id} onDelete={handleDeleteFeed} />
      ))}
      <form
        className="flex h-screen w-full flex-col items-center justify-center"
        onSubmit={onPromise(handleSubmit(onSubmit))}
      >
        <h2 className="card-title">Add feed!</h2>
        <Input type="url" {...register("url")}>
          Url
        </Input>

        <div className="card-actions items-center justify-between">
          <button className="btn btn-secondary" type="submit">
            Add feed
          </button>
        </div>
      </form>
    </>
  );
};
