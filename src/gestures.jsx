import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// Define gestures
const thumbsUpGesture = new GestureDescription('thumbs up');
const okGesture = new GestureDescription('ok');
const victoryGesture = new GestureDescription('victory');
const pointGesture = new GestureDescription('point');
const helloGesture = new GestureDescription('hello');
const thankyouGesture = new GestureDescription('thank you');
const helpGesture = new GestureDescription('help');
const pleaseGesture = new GestureDescription('please');

// Thumbs Up
thumbsUpGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9);
thumbsUpGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9);

// All other fingers are curled
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsUpGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
}

// OK gesture
okGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
okGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
okGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);
okGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);
okGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);
okGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 1.0);

// Other fingers are straight
for(let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  okGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
  okGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// Victory gesture
victoryGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
victoryGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
victoryGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
victoryGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
victoryGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.9);
victoryGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.9);
victoryGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.9);
victoryGesture.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.9);

// Other fingers are curled
for(let finger of [Finger.Thumb, Finger.Ring, Finger.Pinky]) {
  victoryGesture.addCurl(finger, FingerCurl.FullCurl, 0.9);
}

// Point gesture
pointGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
pointGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
pointGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.8);
pointGesture.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.8);

// Other fingers are curled
for(let finger of [Finger.Thumb, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  pointGesture.addCurl(finger, FingerCurl.FullCurl, 0.9);
}

// Hello gesture (open palm, all fingers extended)
for(let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  helloGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
  helloGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// Thank You gesture (palms together)
thankyouGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thankyouGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);
thankyouGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);

for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thankyouGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
  thankyouGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

// Help gesture
helpGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
helpGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1.0);
helpGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);

for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  helpGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
  helpGesture.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
  helpGesture.addDirection(finger, FingerDirection.HorizontalRight, 1.0);
}

// Please gesture
pleaseGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
pleaseGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);
pleaseGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);

for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  pleaseGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
}

export const gestures = [
  thumbsUpGesture,
  okGesture,
  victoryGesture,
  pointGesture,
  helloGesture,
  thankyouGesture,
  helpGesture,
  pleaseGesture
];