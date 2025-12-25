/*
 MIT License
 Default audio playlist referenced by Adventure and Log pages.
*/
import type { Track } from '@/components/organisms/AudioPlayer';

// NOTE: These files exist in public/audio/ - Complete Luminari's Quest soundtrack (16 tracks)
// Arranged in randomized order with user's favorite "The Hearth We Gather 'Round v3" placed early
export const audioPlaylist: Track[] = [
  // User's favorite track placed early in playlist
  {
    src: "/audio/The Hearth We Gather 'Round v3 - Luminari's Quest.mp3",
    title: "The Hearth We Gather 'Round",
  },
  // Randomized order for remaining tracks
  {
    src: "/audio/Shadow Within v1 - Luminari's Quest.mp3",
    title: 'Shadow Within',
  },
  {
    src: "/audio/Rise and Mend v2 - Luminari's Quest.mp3",
    title: 'Rise and Mend (Alternative)',
  },
  {
    src: "/audio/Dreamkeeper's Lullaby v1 - Luminari's Quest.mp3",
    title: "Dreamkeeper's Lullaby",
  },
  {
    src: "/audio/Sanctuary of Light v2 - Luminari's Quest.mp3",
    title: 'Sanctuary of Light (Alternative)',
  },
  {
    src: "/audio/Shadow's Embrace v1 - Luminari's Quest.mp3",
    title: "Shadow's Embrace",
  },
  {
    src: "/audio/The Hearth We Gather 'Round v1 - Luminari's Quest.mp3",
    title: "The Hearth We Gather 'Round (Version 1)",
  },
  {
    src: "/audio/Rise From the Shadows v2 - Luminari's Quest.mp3",
    title: 'Rise From the Shadows (Alternative)',
  },
  {
    src: "/audio/Shadow Within v2 - Luminari's Quest.mp3",
    title: 'Shadow Within (Alternative)',
  },
  {
    src: "/audio/Rise and Mend v1 - Luminari's Quest.mp3",
    title: 'Rise and Mend',
  },
  {
    src: "/audio/Dreamkeeper's Lullaby v2 - Luminari's Quest.mp3",
    title: "Dreamkeeper's Lullaby (Alternative)",
  },
  {
    src: "/audio/The Hearth We Gather 'Round v4 - Luminari's Quest.mp3",
    title: "The Hearth We Gather 'Round (Version 4)",
  },
  {
    src: "/audio/Sanctuary of Light v1 - Luminari's Quest.mp3",
    title: 'Sanctuary of Light',
  },
  {
    src: "/audio/Shadow's Embrace v2 - Luminari's Quest.mp3",
    title: "Shadow's Embrace (Alternative)",
  },
  {
    src: "/audio/Rise From the Shadows v1 - Luminari's Quest.mp3",
    title: 'Rise From the Shadows',
  },
  {
    src: "/audio/The Hearth We Gather 'Round v2 - Luminari's Quest.mp3",
    title: "The Hearth We Gather 'Round (Version 2)",
  },
];
