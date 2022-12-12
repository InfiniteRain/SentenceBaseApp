# SentenceBaseApp

An app that is designed to streamline the [sentence mining](https://refold.la/roadmap/stage-2/a/basic-sentence-mining) process for Japanese learners.

<img src="https://user-images.githubusercontent.com/19305779/207141385-cd7575a2-d8a0-422f-a7cd-829e65543d09.png" alt="screenshot 1" width="400"/>
<img src="https://user-images.githubusercontent.com/19305779/207141398-e7790c27-0092-4e09-a277-eb682014a98c.png" alt="screenshot 1" width="400"/>
<img src="https://user-images.githubusercontent.com/19305779/207141501-7cd3fd24-182c-494c-a58a-e9ec8e846d55.png" alt="screenshot 1" width="400"/>
<img src="https://user-images.githubusercontent.com/19305779/207141507-29663828-702e-4753-82c6-122fa9804e1b.png" alt="screenshot 1" width="400"/>

## Running locally

1. Follow the steps outlined in the [official React Native environment setup guide](https://reactnative.dev/docs/environment-setup).
2. Clone the repository: `git clone git@github.com:InfiniteRain/SentenceBaseApp.git`
3. Install NPM packages: `yarn`
4. Install pods: `npx pod-install`
5. Run in a simulator:
   - For iOS (requires MacOS): `yarn ios`
   - For Android: `yarn android`

## Building for a device

- For iOS (requires MacOS): `npx react-native run-ios --device "DeviceName" --configuration Release`
- For Android: `npx react-native run-android --variant release`
