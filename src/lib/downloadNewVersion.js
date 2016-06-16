import codePush, { UpdateState } from 'react-native-code-push';

const downloadNewVersion = (downloadProgressCallback) => {
	return new Promise((resolve, reject) => {
		// If there is a local update pending use that instead of fetching
		// a potential new update from the server
		codePush.getUpdateMetadata(UpdateState.PENDING).then((localUpdate) => {
			if (localUpdate) return resolve(localUpdate);
			// Queries the CodePush service to see whether the configured app deployment has an update available.
			// By default, it will use the deployment key that is configured in your Info.plist file (iOS), or MainActivity.java file (Android)
			codePush.checkForUpdate().then((remoteUpdate) => {
				if (!remoteUpdate) return resolve(null);
				/*
				remoteUpdate === null can be due to the following reasons:
				- No CodePush updates were installed since the last time disallowRestart was called, and therefore, there isn't any need to restart anyways.
				- There is currently a pending CodePush update, but it was installed via InstallMode.ON_NEXT_RESUME and the app hasn't been put into the background yet, and therefore, there isn't a need to programmatically restart yet.
				- The currently running app already has the latest release from the configured deployment, and therefore, doesn't need it again.
				- No calls to restartApp were made since the last time disallowRestart was called.
				*/
				remoteUpdate
				// downloadProgressCallback is periodically called with a DownloadProgress object
				// than looks like { totalBytes: Number, receivedBytes: Number }
				.download(downloadProgressCallback)
				.then(resolve);
			});
		});
	});
};

export default downloadNewVersion;
