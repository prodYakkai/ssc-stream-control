import { SrsForwardResponse, SrsPublish } from '../types/SrsPublish';
import { prisma } from '..';

export const SrsForwardHandler = async (
  payload: SrsPublish,
  resolve: (T: SrsForwardResponse) => void,
  reject: () => void,
) => {
  const parsedParams = Object.fromEntries(new URLSearchParams(payload.param));
  if (payload.app !== 'live') {
    reject(); // do not forward non-live streams
    return;
  }

  if (payload.tcUrl === '') {
    reject(); // do not forward non-rtmp streams
    // TODO: figure out why webrtc ingest drops frames
    return;
  }

  const streamInfo = await prisma.stream.findFirst({
    where: {
      ingestKey: parsedParams.key,
    },
    include: {
      destination: true,
    },
  });

  if (!streamInfo) {
    console.error(`No stream found for key ${parsedParams.key}`);
    reject();
    return;
  }

  // determine if this need to forward to a custom destination
  if (streamInfo.destination) {
    console.log(
      `Forwarding stream ${streamInfo.name} to ${streamInfo.destination.name}`,
    );
    resolve({
      urls: [
        `rtmp://127.0.0.1/view/${streamInfo.destination.name}?vhost=playback`,
      ],
    });
    return;
  }

  // if not found, then do not forward
  resolve({
    urls: [],
  });
};