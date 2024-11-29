import { SrsPublish } from '../types/SrsPublish';
import { prisma } from '..';

export const SrsStopHandler = (
  payload: SrsPublish,
  resolve: (T: number) => void,
) => {
  console.log(`Stopping ${payload.stream} with client ${payload.client_id}`);

  prisma.viewer.deleteMany({
    where: {
      srsClientId: payload.client_id,
    },
  });

  resolve(0);
};
