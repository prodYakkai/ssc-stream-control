import {
  Stream,
  Viewer,
  Category,
  ReservedDestination,
  Event,
} from '@prisma/client';

interface StreamWithKeyParams extends Stream, StreamPlayParams {}

interface StreamWithAll extends Stream {
  event: Event;
  destination: ReservedDestination;
  category: Category;
  viewers: Viewer[];
}

interface StreamPlayParams {
  start: number;
  expire: number;
  sign: string;
}

interface StreamURLParams {
  category: string;
  name: string;
  key: string;
  publish?: boolean;

  // View only params
  playbackParams?: StreamPlayParams;
}
