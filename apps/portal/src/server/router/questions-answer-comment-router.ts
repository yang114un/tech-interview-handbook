import { z } from 'zod';
import { Vote } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { createProtectedRouter } from './context';

import type { AnswerComment } from '~/types/questions';

export const questionsAnswerCommentRouter = createProtectedRouter()
  .query('getAnswerComments', {
    input: z.object({
      answerId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const questionAnswerCommentsData = await ctx.prisma.questionsAnswerComment.findMany({
        include: {
        user: {
          select: {
            name: true,
          },
        },
        votes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          ...input,
        },
    });
    return questionAnswerCommentsData.map((data) => {
      const votes:number = data.votes.reduce(
        (previousValue:number, currentValue) => {
          let result:number = previousValue;

          switch(currentValue.vote) {
          case Vote.UPVOTE:
            result += 1
            break;
          case Vote.DOWNVOTE:
            result -= 1
            break;
          }
          return result;
        },
        0
        );

      let userName = "";

      if (data.user) {
        userName = data.user.name!;
      }


      const answerComment: AnswerComment = {
        content: data.content,
        id: data.id,
        numVotes: votes,
        updatedAt: data.updatedAt,
        user: userName,
      };
      return answerComment;
    });
    }
  })
  .mutation('create', {
    input: z.object({
      answerId: z.string(),
      content: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;

      return await ctx.prisma.questionsAnswerComment.create({
        data: {
          ...input,
          userId,
        },
      });
    },
  })
  .mutation('update', {
    input: z.object({
      content: z.string().optional(),
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;

      const answerCommentToUpdate = await ctx.prisma.questionsAnswerComment.findUnique({
        where: {
          id: input.id,
        },
      });

      if (answerCommentToUpdate?.id !== userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User have no authorization to record.',
        });
      }

      return await ctx.prisma.questionsAnswerComment.update({
        data: {
          ...input,
        },
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.id;

      const answerCommentToDelete = await ctx.prisma.questionsAnswerComment.findUnique({
        where: {
          id: input.id,
        },
      });

      if (answerCommentToDelete?.id !== userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User have no authorization to record.',
        });
      }

      return await ctx.prisma.questionsAnswerComment.delete({
        where: {
          id: input.id,
        },
      });
    },
  });