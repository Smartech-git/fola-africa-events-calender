type Image = {
  width: number;
  height: number;
  src: string;
  alt: string;
  mimeType?: string;
}

type Video = {
  type: string;
  src: string;
  poster?: string;
}
