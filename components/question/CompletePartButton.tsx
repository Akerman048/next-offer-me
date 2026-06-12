import { completePartAndRedirect } from "@/app/topics/[slug]/[lessonSlug]/[partId]/actions";

type Props = {
  partId: string;
  nextPath: string;
  currentPath: string;
  hasNextPart: boolean;
};

export default function CompletePartButton({
  partId,
  nextPath,
  currentPath,
  hasNextPart,
}: Props) {
  return (
    <form action={completePartAndRedirect} className="mt-8">
      <input type="hidden" name="partId" value={partId} />
      <input type="hidden" name="nextPath" value={nextPath} />
      <input type="hidden" name="currentPath" value={currentPath} />

      <button
        type="submit"
        className="rounded-lg bg-black px-5 py-3 text-white transition hover:cursor-pointer hover:bg-neutral-800"
      >
        {hasNextPart ? "Continue →" : "Finish lesson"}
      </button>
    </form>
  );
}