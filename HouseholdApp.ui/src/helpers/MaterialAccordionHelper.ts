export interface AssignmentWithImage {
  [key: string]: any;
  image?: string;
}

export function mergeAssignmentsWithImages(
  userAssignments: any[],
  images: any[],
): AssignmentWithImage[] {
  return userAssignments.map((ua) => {
    const theImage = images.find((image) => ua.choreId === image.choreId);
    return theImage ? { ...ua, image: theImage.image } : { ...ua };
  });
}
