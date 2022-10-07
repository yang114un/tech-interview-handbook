import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Tabs } from '@tih/ui';

import { trpc } from '~/utils/trpc';

import Comment from './comment/Comment';
import CommentsListButton from './CommentsListButton';
import { COMMENTS_SECTIONS } from './constants';

import type { ResumeComment } from '~/types/resume-comments';

type CommentsListProps = Readonly<{
  resumeId: string;
  setShowCommentsForm: (show: boolean) => void;
}>;

export default function CommentsList({
  resumeId,
  setShowCommentsForm,
}: CommentsListProps) {
  const [tab, setTab] = useState(COMMENTS_SECTIONS[0].value);
  const [comments, setComments] = useState<Array<ResumeComment>>([]);
  const { data: session } = useSession();

  // Fetch the most updated comments to render
  trpc.useQuery(['resumes.reviews.list', { resumeId, tab }], {
    onSuccess: setComments,
  });

  return (
    <div className="space-y-3">
      <CommentsListButton setShowCommentsForm={setShowCommentsForm} />
      <Tabs
        label="comments"
        tabs={COMMENTS_SECTIONS}
        value={tab}
        onChange={(value) => setTab(value)}
      />

      <div className="m-2 flow-root h-[calc(100vh-20rem)] w-full flex-col space-y-3 overflow-y-scroll">
        {comments.map((comment) => {
          return (
            <Comment
              key={comment.id}
              comment={comment}
              userId={session?.user?.id}
            />
          );
        })}
      </div>
    </div>
  );
}
